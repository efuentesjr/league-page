// src/routes/team/[slug]/+layout.js
import { managers, leagueID } from '$lib/utils/leagueInfo';
import { env } from '$env/dynamic/public';

/* ---------- helpers ---------- */

function prettifySlug(str = '') {
  return String(str)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const num = (x) => (x == null ? 0 : Number(x) || 0);
const fp  = (whole, dec) => num(whole) + num(dec) / 100;

function parseOddsStrings(r) {
  // Accept either "C:80.0% T:3.7%" or status:{playoffs:'80.0%', title:'3.7%'}
  const divStr =
    r.divStatus ?? r.DivSTATUS ?? r.status?.division ?? '';
  const playStr =
    r.playStatus ?? r.PlaySTATUS ??
    [
      r.status?.playoffs ? `C:${r.status.playoffs}` : '',
      r.status?.title ? `T:${r.status.title}` : ''
    ].filter(Boolean).join(' ');

  const divMatch = String(divStr).match(/([\d.]+)%/);
  const poMatch  = String(playStr).match(/C:\s*([\d.]+)%/i);
  const titMatch = String(playStr).match(/T:\s*([\d.]+)%/i);

  return {
    winDivision: divMatch ? Number(divMatch[1]) : null,
    makePlayoffs: poMatch ? Number(poMatch[1]) : null,
    winTitle: titMatch ? Number(titMatch[1]) : null
  };
}

function normalizeProjection(r, slug) {
  // record "3-0-0" → wins/losses/ties (fallback to explicit fields)
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = w ?? 0; losses = l ?? 0; ties = t ?? 0;
  } else {
    wins = r.wins ?? 0; losses = r.losses ?? 0; ties = r.ties ?? 0;
  }

  const division = r.division ?? r.Dv ?? '';
  const points   = Number(r.points ?? r.Pts ?? 0);

  // Keep original strings for the UI, too
  const divStatus =
    r.divStatus ?? r.DivSTATUS ?? (r.status?.division ? `C:${r.status.division}` : '');
  const playStatus =
    r.playStatus ?? r.PlaySTATUS ??
    [
      r.status?.playoffs ? `C:${r.status.playoffs}` : '',
      r.status?.title ? `T:${r.status.title}` : ''
    ].filter(Boolean).join(' ');

  // Extra projection fields (support multiple keys)
  const min      = r.min ?? r.mIn ?? null;
  const targets  = r.targets ?? r.Targets ?? '';
  const gIn      = r.gIn ?? r.gamesIn ?? null;
  const divTgts  = r.divTgts ?? r.divisionTargets ?? '';

  return {
    slug: r.slug ?? slug,
    division,
    wins, losses, ties,
    points,
    divStatus,
    playStatus,
    odds: parseOddsStrings({ divStatus, playStatus, status: r.status }),
    min,
    targets,
    gIn,
    divTgts
  };
}

/* ---------- loader ---------- */

export async function load({ params, fetch }) {
  const { slug } = params;

  // Manager config for this slug
  const m = Array.isArray(managers) ? managers.find((x) => x.slug === slug) : null;

  // TEAM title only (never use manager name as title)
  const teamTitle = (m?.teamName || m?.team_name || '').trim() || prettifySlug(slug);
  const managerName = (m?.name || '').trim();

  // Hero & Logo
  const img = `/team/${slug}.jpg`;
  const cdnBase = (env.PUBLIC_TEAM_LOGO_BASE || '').replace(/\/$/, '');
  const logoFromCdn = cdnBase ? `${cdnBase}/${slug}.png` : '';
  const logoFromStatic = `/playoffs-projection/${slug}.png`;
  const logoUrl = logoFromCdn || logoFromStatic || '';

  // ---- Pull projections row for this team ----
  const projectionsUrl = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  let proj = null;

  if (projectionsUrl) {
    try {
      const res = await fetch(projectionsUrl, { cache: 'no-store' });
      if (res.ok) {
        const raw  = await res.json();
        const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

        // Prefer row with exact slug; fall back to team label match if needed
        let hit = rows.find((r) => r.slug === slug);
        if (!hit && m?.teamName) {
          hit = rows.find((r) => (r.team || '').trim() === m.teamName.trim());
        }

        if (hit) proj = normalizeProjection(hit, slug);
      }
    } catch {
      // ignore; page will still render
    }
  }

  // ---- Live record / PF / PA from Sleeper (fallback to projections) ----
  let sleeper = null;
  const managerID = m?.managerID;

  if (leagueID && managerID) {
    try {
      const rRes = await fetch(
        `https://api.sleeper.app/v1/league/${leagueID}/rosters`,
        { cache: 'no-store' }
      );
      if (rRes.ok) {
        const rosters = await rRes.json();
        const roster = rosters.find((r) => String(r.owner_id) === String(managerID));
        if (roster?.settings) {
          const s = roster.settings;
          sleeper = {
            wins: num(s.wins),
            losses: num(s.losses),
            ties: num(s.ties),
            pointsFor: fp(s.fpts, s.fpts_decimal),
            pointsAgainst: fp(s.fpts_against, s.fpts_against_decimal)
          };
        }
      }
    } catch {
      // ignore network/API issues
    }
  }

  // Compose the team object the page consumes
  const team = {
    // division / record
    division: proj?.division ?? '',
    wins: sleeper?.wins ?? proj?.wins ?? 0,
    losses: sleeper?.losses ?? proj?.losses ?? 0,
    ties: sleeper?.ties ?? proj?.ties ?? 0,

    // points
    points: sleeper?.pointsFor ?? proj?.points ?? 0,         // legacy
    pointsFor: sleeper?.pointsFor ?? proj?.points ?? 0,      // preferred
    pointsAgainst: sleeper?.pointsAgainst ?? null,

    // statuses / odds
    divStatus: proj?.divStatus ?? '',
    playStatus: proj?.playStatus ?? '',
    odds: proj?.odds ?? { winDivision: null, makePlayoffs: null, winTitle: null },

    // projection extras
    min: proj?.min ?? null,
    targets: proj?.targets ?? '',
    gIn: proj?.gIn ?? null,
    divTgts: proj?.divTgts ?? ''
  };

  const avatarBasePath = '/playoffs-projection';

  return {
    title: teamTitle,
    managerName,
    img,
    logoUrl,
    team,
    avatarBasePath
  };
}