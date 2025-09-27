// src/lib/data/sos.js
import { leagueID } from '$lib/utils/leagueInfo';

const SLEEPER = 'https://api.sleeper.app/v1';

// slugify/team-name normalizer (so we can match your projections by team)
export const norm = (s) => (s || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

// ----- Fetch data from Sleeper -----
async function getLeagueMeta(fetch) {
  const res = await fetch(`${SLEEPER}/league/${leagueID}`);
  if (!res.ok) throw new Error('Failed to fetch league meta');
  return res.json(); // has season, settings, etc.
}

async function getRosters(fetch) {
  const res = await fetch(`${SLEEPER}/league/${leagueID}/rosters`);
  if (!res.ok) throw new Error('Failed to fetch rosters');
  return res.json(); // [{ roster_id, owner_id, ... }]
}

async function getMatchupsForWeek(fetch, week) {
  const res = await fetch(`${SLEEPER}/league/${leagueID}/matchups/${week}`);
  if (!res.ok) throw new Error(`Failed matchups for week ${week}`);
  return res.json(); // [{ roster_id, matchup_id, points, ... }]
}

// ----- Build schedule & points maps -----
function buildWeekPairs(matchups) {
  // Group by matchup_id → list of rosters in the same game
  const byMatchup = new Map();
  for (const m of matchups) {
    const list = byMatchup.get(m.matchup_id) || [];
    list.push(m);
    byMatchup.set(m.matchup_id, list);
  }
  // Convert to rosterId → { oppRosterId, myPts, oppPts }
  const pairs = [];
  for (const list of byMatchup.values()) {
    if (list.length < 2) continue; // bye or incomplete
    const [a, b] = list;
    pairs.push(
      { me: a.roster_id, opp: b.roster_id, myPts: a.points || 0, oppPts: b.points || 0 },
      { me: b.roster_id, opp: a.roster_id, myPts: b.points || 0, oppPts: a.points || 0 },
    );
  }
  return pairs;
}

// Compute SoS
export async function computeSOS(fetch) {
  const league = await getLeagueMeta(fetch);
  const rosters = await getRosters(fetch);

  // Determine regular season weeks. Many leagues use 14; prefer settings if available.
  const regWeeks = Number(league.settings?.playoff_week_start) - 1 || 14;

  // Pull all played weeks (up to regWeeks) and build opponent lists
  const oppByRoster = new Map();            // roster_id -> [{week, opp, oppPts}]
  const myPtsByRoster = new Map();          // roster_id -> total PF
  const gpByRoster = new Map();             // roster_id -> games played

  for (let w = 1; w <= regWeeks; w++) {
    const ms = await getMatchupsForWeek(fetch, w);
    const pairs = buildWeekPairs(ms);
    if (pairs.length === 0) continue;

    for (const p of pairs) {
      if (!oppByRoster.has(p.me)) oppByRoster.set(p.me, []);
      oppByRoster.get(p.me).push({ week: w, opp: p.opp, oppPts: p.oppPts });

      myPtsByRoster.set(p.me, (myPtsByRoster.get(p.me) || 0) + (p.myPts || 0));
      gpByRoster.set(p.me, (gpByRoster.get(p.me) || 0) + 1);
    }
  }

  // League average PPG (to normalize SoS)
  const totalPF = Array.from(myPtsByRoster.values()).reduce((a, b) => a + b, 0);
  const totalGP = Array.from(gpByRoster.values()).reduce((a, b) => a + b, 0);
  const leagueAvgPPG = totalGP ? totalPF / totalGP : 0;

  // Season-to-date PPG per roster (for future SoS)
  const ppgByRoster = new Map();
  for (const r of rosters) {
    const pf = myPtsByRoster.get(r.roster_id) || 0;
    const gp = gpByRoster.get(r.roster_id) || 0;
    ppgByRoster.set(r.roster_id, gp ? pf / gp : 0);
  }

  // Build full schedule (who you face each week) so we can compute ROS
  // We already have historical opponents in oppByRoster.
  // For future weeks, we still need the schedule structure. Sleeper does not expose a single endpoint
  // for future matchups of custom leagues, so a common approach is: pull matchups for *all* regWeeks
  // at the start of the season (they exist with 0 points), or if not present, compute ROS using div round-robin
  // rules or skip future if not available. Below tries to fetch schedule even for future weeks.
  const scheduleByRoster = new Map();
  for (const r of rosters) scheduleByRoster.set(r.roster_id, new Map()); // week -> oppId

  for (let w = 1; w <= regWeeks; w++) {
    const ms = await getMatchupsForWeek(fetch, w);
    const pairs = buildWeekPairs(ms);
    for (const p of pairs) {
      scheduleByRoster.get(p.me).set(w, p.opp);
    }
  }

  // Figure out current week = max week with any GP
  const currentWeek = [...scheduleByRoster.values()].reduce((maxW, m) => {
    const playedWeeks = [...m.keys()].filter(w => (oppByRoster.get([...scheduleByRoster.keys()][0]) || []).some(x=>x.week===w));
    return Math.max(maxW, ...(playedWeeks.length ? playedWeeks : [0]));
  }, 0);

  // Compute Past SoS (Opp PPG faced)
  const past = new Map();  // roster_id -> { oppPPG, index }
  for (const r of rosters) {
    const opps = (oppByRoster.get(r.roster_id) || []);
    const gp = gpByRoster.get(r.roster_id) || 0;
    const oppPtsSum = opps.reduce((a, x) => a + x.oppPts, 0);
    const oppPPG = gp ? oppPtsSum / gp : 0;
    const index = leagueAvgPPG ? (oppPPG / leagueAvgPPG) : 0;
    past.set(r.roster_id, { oppPPG, index });
  }

  // Compute Future SoS (average current PPG of remaining opponents)
  const future = new Map(); // roster_id -> { oppPPG, index }
  for (const r of rosters) {
    const sched = scheduleByRoster.get(r.roster_id) || new Map();
    const futureOpps = [...sched.entries()]
      .filter(([week]) => week > currentWeek)
      .map(([, opp]) => opp);

    const oppPPG = futureOpps.length
      ? futureOpps.reduce((a, opp) => a + (ppgByRoster.get(opp) || 0), 0) / futureOpps.length
      : 0;

    const index = leagueAvgPPG ? (oppPPG / leagueAvgPPG) : 0;
    future.set(r.roster_id, { oppPPG, index });
  }

  // Return by roster_id; UI can map roster → team/slug
  return {
    leagueAvgPPG,
    past,   // Map(roster_id -> { oppPPG, index })
    future, // Map(roster_id -> { oppPPG, index })
  };
}
