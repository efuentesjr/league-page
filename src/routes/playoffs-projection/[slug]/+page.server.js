// src/routes/playoffs-projection/[slug]/+page.server.js
import { error } from '@sveltejs/kit';
import { SLEEPER_LEAGUE_ID, PUBLIC_PROJECTIONS_URL } from '$env/static/private';
import { managers } from '$lib/utils/leagueInfo';

// ---- helpers: safe fetch JSON ----
async function safeJSON(fetch, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Try multiple common keys to read a value from a manager object
function pick(m, keys = []) {
  for (const k of keys) {
    if (m && m[k] != null) return m[k];
  }
  return undefined;
}

// Build maps to translate Sleeper IDs -> our slugs
function buildSlugMaps(managersArr) {
  const byRosterId = new Map();
  const byOwnerId  = new Map();
  const byUserId   = new Map();

  for (const m of managersArr || []) {
    const slug = pick(m, ['slug', 'Slug']) || '';
    if (!slug) continue;

    const rosterId = pick(m, ['rosterId', 'roster_id', 'sleeperRosterId', 'sleeper_roster_id']);
    const ownerId  = pick(m, ['ownerId', 'owner_id', 'sleeperOwnerId', 'sleeper_owner_id']);
    const userId   = pick(m, ['userId', 'user_id', 'sleeperUserId', 'sleeper_user_id']);

    if (rosterId != null) byRosterId.set(Number(rosterId), slug);
    if (ownerId  != null) byOwnerId.set(String(ownerId), slug);
    if (userId   != null) byUserId.set(String(userId), slug);
  }
  return { byRosterId, byOwnerId, byUserId };
}

// Compute a conservative "currentWeek" (can be overridden by env or other logic)
function inferCurrentWeek() {
  // Simple fallback: clamp to [1, 18]
  const now = new Date();
  // If you track the true week elsewhere, wire it in here.
  const week = Math.min(18, Math.max(1, Math.floor((now.getMonth() + 1) / 1.5)));
  return week;
}

// Pair Sleeper matchups into games by matchup_id → two rosters
function pairMatchupsToGames(week, matchups, rosterIdToSlug) {
  const byMid = new Map();
  for (const m of matchups || []) {
    const mid = m.matchup_id;
    if (mid == null) continue;
    if (!byMid.has(mid)) byMid.set(mid, []);
    byMid.get(mid).push(m);
  }

  const games = [];
  for (const [_mid, arr] of byMid.entries()) {
    if (arr.length < 2) continue; // ignore incomplete pairs
    const a = arr[0], b = arr[1];
    const slugA = rosterIdToSlug.get(Number(a.roster_id));
    const slugB = rosterIdToSlug.get(Number(b.roster_id));
    if (!slugA || !slugB) continue;

    // Sleeper doesn't define home/away; pick deterministically
    const home = slugA.localeCompare(slugB) <= 0 ? slugA : slugB;
    const away = home === slugA ? slugB : slugA;

    games.push({ week, home, away, played: false });
  }
  return games;
}

export const load = async ({ params, fetch }) => {
  const slug = params.slug;

  // -------- 1) Your existing team payload (keep your logic here) --------
  // This is a placeholder. Replace with your real source if different.
  // For example, you might be reading a single-team object from your R2/projections feed.
  // Here we construct a minimal shape so the page never breaks.
  let team = {
    team: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    division: '',
    record: '0-0-0',
    points: 0,
    status: { division: '0%', playoffs: '0%', tie: '0%' },
    targets: '',
    min: ''
  };

  // If your current server already sets `team`, preserve it:
  // (Uncomment and adapt to your actual data source)
  // const teamFromR2 = await safeJSON(fetch, YOUR_TEAM_ENDPOINT_HERE);
  // if (teamFromR2) team = teamFromR2;

  const avatarBasePath = '/playoffs-projection/avatars';

  // -------- 2) Build ID maps from your managers config --------
  const { byRosterId, byOwnerId } = buildSlugMaps(managers || []);

  // -------- 3) Fetch Sleeper rosters to map roster_id -> owner_id --------
  const leagueId = SLEEPER_LEAGUE_ID;
  let rosterOwner = new Map(); // roster_id (number) -> owner_id (string)

  if (leagueId) {
    const rosters = await safeJSON(fetch, `https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    if (Array.isArray(rosters)) {
      for (const r of rosters) {
        const rid = Number(r.roster_id);
        const owner = String(r.owner_id ?? '');
        if (rid && owner) rosterOwner.set(rid, owner);
      }
    }
  }

  // Build roster_id -> slug map (prefer direct mapping; else via owner_id)
  const rosterIdToSlug = new Map();
  for (const [rid, owner] of rosterOwner.entries()) {
    const direct = byRosterId.get(rid);
    const viaOwner = byOwnerId.get(owner);
    if (direct) rosterIdToSlug.set(rid, direct);
    else if (viaOwner) rosterIdToSlug.set(rid, viaOwner);
  }

  // -------- 4) Determine current week and fetch remaining matchups --------
  const currentWeek = inferCurrentWeek();
  const MAX_WEEK = 18;
  let schedule = [];

  if (leagueId && rosterIdToSlug.size > 0) {
    for (let wk = currentWeek; wk <= MAX_WEEK; wk++) {
      const matchups = await safeJSON(fetch, `https://api.sleeper.app/v1/league/${leagueId}/matchups/${wk}`);
      if (!Array.isArray(matchups)) continue;
      const games = pairMatchupsToGames(wk, matchups, rosterIdToSlug);
      schedule.push(...games);
    }
  }

  // -------- 5) allTeams snapshot for SOS opponent rating (record/points) --------
  // If you have a projections feed (R2), we try to read it.
  // Expecting array with items like: { slug, record, points, ... }
  let allTeams = [];
  if (PUBLIC_PROJECTIONS_URL) {
    const proj = await safeJSON(fetch, PUBLIC_PROJECTIONS_URL);
    if (Array.isArray(proj)) {
      // Normalize a few likely shapes
      allTeams = proj.map((p) => ({
        slug: p.slug ?? p.Slug ?? p.team_slug ?? p.team?.toLowerCase?.().replace(/\s+/g,'-') ?? '',
        record: p.record ?? p.Record ?? `${p.wins ?? 0}-${p.losses ?? 0}${p.ties ? `-${p.ties}` : ''}`,
        points: Number(p.points ?? p.Points ?? 0)
      })).filter(t => t.slug);a
    }
  }

  // Soft fallback: if no projections, at least include the current team
  if (allTeams.length === 0) {
    allTeams = [{
      slug,
      record: team.record || '0-0-0',
      points: Number(team.points || 0)
    }];
  }

  // -------- 6) Return everything the page needs --------
  return {
    slug,
    team,
    avatarBasePath,
    // New fields used by your SOS UI:
    schedule,      // [{ week, home, away, played:false }, ...] for weeks >= currentWeek
    allTeams,      // [{ slug, record, points }, ...]
    currentWeek    // number
  };
};
