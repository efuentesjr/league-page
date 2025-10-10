// src/routes/playoffs-projection/[slug]/+page.server.js
import { env } from '$env/dynamic/private';                 // private env at runtime
import { PUBLIC_PROJECTIONS_URL } from '$env/static/public'; // your public R2 JSON
import { managers } from '$lib/utils/leagueInfo';

// ----------------- tiny utils -----------------
const norm = (s) => String(s || '').trim().toLowerCase();
const title = (s) => String(s || '').replace(/-/g, ' ')
  .replace(/\b\w/g, (c) => c.toUpperCase());

async function safeJSON(fetch, url) {
  try { const r = await fetch(url); if (!r.ok) return null; return r.json(); }
  catch { return null; }
}

function pick(m, keys) { for (const k of keys) if (m?.[k] != null) return m[k]; }

// Build mappings between your manager slugs and team names
const bySlug = new Map((Array.isArray(managers) ? managers : []).map(m => [m.slug, m]));
const slugByTeamName = new Map((Array.isArray(managers) ? managers : []).map(m => {
  const name = pick(m, ['teamName', 'team_name', 'team']) || '';
  return [norm(name), m.slug];
}));

// -------- Sleeper helpers (for SOS) --------
function buildSlugMaps(managersArr) {
  const byRosterId = new Map();
  const byOwnerId  = new Map();
  for (const m of managersArr || []) {
    const slug = pick(m, ['slug', 'Slug']) || '';
    if (!slug) continue;
    const rosterId = pick(m, ['rosterId','roster_id','sleeperRosterId','sleeper_roster_id']);
    const ownerId  = pick(m, ['ownerId','owner_id','sleeperOwnerId','sleeper_owner_id']);
    if (rosterId != null) byRosterId.set(Number(rosterId), slug);
    if (ownerId  != null) byOwnerId.set(String(ownerId), slug);
  }
  return { byRosterId, byOwnerId };
}

function pairMatchupsToGames(week, matchups, rosterIdToSlug) {
  const byMid = new Map();
  for (const m of matchups || []) {
    const mid = m.matchup_id; if (mid == null) continue;
    if (!byMid.has(mid)) byMid.set(mid, []);
    byMid.get(mid).push(m);
  }
  const games = [];
  for (const [_mid, arr] of byMid.entries()) {
    if (arr.length < 2) continue;
    const a = arr[0], b = arr[1];
    const sa = rosterIdToSlug.get(Number(a.roster_id));
    const sb = rosterIdToSlug.get(Number(b.roster_id));
    if (!sa || !sb) continue;
    const home = sa.localeCompare(sb) <= 0 ? sa : sb;
    const away = home === sa ? sb : sa;
    games.push({ week, home, away, played: false });
  }
  return games;
}

function inferCurrentWeek() {
  // simple fallback; replace if you track true NFL week
  const now = new Date();
  return Math.min(18, Math.max(1, Math.floor((now.getMonth() + 1) / 1.5)));
}

// ----------------- main load -----------------
export const load = async ({ params, fetch }) => {
  const slug = params.slug;

  // 1) Pull your projections JSON (R2) and rebuild the per-team object
  const projections = PUBLIC_PROJECTIONS_URL
    ? await safeJSON(fetch, PUBLIC_PROJECTIONS_URL)
    : null;

  // Resolve the intended team name for this slug from managers config
  const m = bySlug.get(slug);
  const desiredName =
    pick(m, ['teamName', 'team_name', 'team']) || title(slug);

  // Find the matching row in projections by team name (case-insensitive)
  let row = Array.isArray(projections)
    ? projections.find(p => norm(p.team) === norm(desiredName))
    : null;

  // Build the exact shape your +page.svelte expects
  let team = {
    team: row?.team ?? desiredName,
    division: row?.division ?? '',
    record: row?.record ?? `${row?.wins ?? 0}-${row?.losses ?? 0}${row?.ties ? `-${row?.ties}` : ''}`,
    points: Number(row?.points ?? 0),
    status: {
      division: row?.status?.division ?? (row?.divStatus ?? ''),
      playoffs: row?.status?.playoffs ?? (row?.playStatus ?? ''),
      tie:      row?.status?.title     ?? '' // if you track tie separately, map it here
    },
    targets: row?.targets ?? '',
    min: row?.min ?? ''
  };

  const avatarBasePath = '/playoffs-projection/avatars';

  // 2) Prepare allTeams snapshot (used to rate opponents for SOS)
  let allTeams = [];
  if (Array.isArray(projections)) {
    allTeams = projections.map(p => {
      // map projection team name back to slug via managers
      const s = slugByTeamName.get(norm(p.team)) || '';
      return {
        slug: s,
        record: p.record ?? `${p.wins ?? 0}-${p.losses ?? 0}${p.ties ? `-${p.ties}` : ''}`,
        points: Number(p.points ?? 0)
      };
    }).filter(t => t.slug);
  } else {
    // soft fallback so page never breaks
    allTeams = [{ slug, record: team.record, points: team.points }];
  }

  // 3) Pull remaining matchups from Sleeper for SOS (optional; fails soft)
  const { byRosterId, byOwnerId } = buildSlugMaps(managers || []);
  const LEAGUE = env.SLEEPER_LEAGUE_ID || '';
  const rosterOwner = new Map();
  if (LEAGUE) {
    const rosters = await safeJSON(fetch, `https://api.sleeper.app/v1/league/${LEAGUE}/rosters`);
    if (Array.isArray(rosters)) {
      for (const r of rosters) {
        const rid = Number(r.roster_id);
        const owner = String(r.owner_id ?? '');
        if (rid && owner) rosterOwner.set(rid, owner);
      }
    }
  }
  const rosterIdToSlug = new Map();
  for (const [rid, owner] of rosterOwner.entries()) {
    const direct = byRosterId.get(rid);
    const viaOwner = byOwnerId.get(owner);
    if (direct) rosterIdToSlug.set(rid, direct);
    else if (viaOwner) rosterIdToSlug.set(rid, viaOwner);
  }

  const currentWeek = inferCurrentWeek();
  const MAX_WEEK = 18;
  let schedule = [];
  if (LEAGUE && rosterIdToSlug.size > 0) {
    for (let wk = currentWeek; wk <= MAX_WEEK; wk++) {
      const matchups = await safeJSON(fetch, `https://api.sleeper.app/v1/league/${LEAGUE}/matchups/${wk}`);
      if (!Array.isArray(matchups)) continue;
      schedule.push(...pairMatchupsToGames(wk, matchups, rosterIdToSlug));
    }
  }

  return {
    slug,
    team,
    avatarBasePath,
    // For SOS UI:
    schedule,      // remaining games from currentWeek forward
    allTeams,      // [{ slug, record, points }]
    currentWeek
  };
};
