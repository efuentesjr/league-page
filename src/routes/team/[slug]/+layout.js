// src/routes/team/[slug]/+layout.js
import { managers, leagueID } from '$lib/utils/leagueInfo';
import { env } from '$env/dynamic/public';

function prettifySlug(str = '') {
  return String(str)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// normalize projections row -> what we need on the page
function normalizeProjection(r) {
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = w ?? 0; losses = l ?? 0; ties = t ?? 0;
  } else {
    wins = r.wins ?? 0; losses = r.losses ?? 0; ties = r.ties ?? 0;
  }

  const division  = r.division ?? r.Dv ?? '';
  const points    = Number(r.points ?? r.Pts ?? 0);

  // "C:80.0%" etc → numbers
  const divMatch  = String(r.divStatus ?? r.DivSTATUS ?? r.status?.division ?? '')
    .match(/([\d.]+)%/);
  const playoffsMatch = String(
      r.playStatus ?? r.PlaySTATUS ??
      [r.status?.playoffs ? `C:${r.status.playoffs}` : '',
       r.status?.title ? `T:${r.status.title}` : ''].filter(Boolean).join(' ')
    ).match(/C:\s*([\d.]+)%/i);
  const titleMatch = String(
      r.playStatus ?? r.PlaySTATUS ??
      [r.status?.playoffs ? `C:${r.status.playoffs}` : '',
       r.status?.title ? `T:${r.status.title}` : ''].filter(Boolean).join(' ')
    ).match(/T:\s*([\d.]+)%/i);

  return {
    slug: r.slug,
    division,
    wins, losses, ties,
    points,
    divStatus: r.divStatus ?? r.DivSTATUS ?? (r.status?.division ? `C:${r.status.division}` : ''),
    playStatus:
      r.playStatus ?? r.PlaySTATUS ??
      [r.status?.playoffs ? `C:${r.status.playoffs}` : '', r.status?.title ? `T:${r.status.title}` : '']
        .filter(Boolean).join(' '),
    odds: {
      winDivision: divMatch ? Number(divMatch[1]) : null,
      makePlayoffs: playoffsMatch ? Number(playoffsMatch[1]) : null,
      winTitle: titleMatch ? Number(titleMatch[1]) : null
    }
  };
}

// combine integer + decimal Sleeper fields
const num = (x) => (x == null ? 0 : Number(x) || 0);
const fp = (whole, dec) => num(whole) + num(dec) / 100;

export async function load({ params, fetch }) {
  const { slug } = params;

  // Manager config
  const m = Array.isArray(managers) ? managers.find((x) => x.slug === slug) : null;

  // TEAM title only (no manager fallback)
  const teamTitle = (m?.teamName || m?.team_name || '').trim() || prettifySlug(slug);
  const managerName = (m?.name || '').trim();

  // Hero & Logo
  const img = `/team/${slug}.jpg`;
  const cdnBase = (env.PUBLIC_TEAM_LOGO_BASE || '').replace(/\/$/, '');
  const logoFromCdn = cdnBase ? `${cdnBase}/${slug}.png` : '';
  const logoFromStatic = `/playoffs-projection/${slug}.png`;
  const logoUrl = logoFromCdn || logoFromStatic || '';

  // --- Get projections row (for odds + points if you want)
  const projectionsUrl = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  let proj = null;
  if (projectionsUrl) {
    try {
      const res = await fetch(projectionsUrl, { cache: 'no-store' });
      if (res.ok) {
        const raw  = await res.json();
        const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const hit  = rows.find((r) => r.slug === slug);
        if (hit) proj = normalizeProjection(hit);
      }
    } catch {/* ignore */}
  }

  // --- Pull live team stats from Sleeper (record / PF / PA)
  // map slug -> managerID (owner user_id)
  const managerID = m?.managerID;
  let sleeper = null;

  if (leagueID && managerID) {
    try {
      const rRes = await fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`, { cache: 'no-store' });
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
    } catch {/* ignore */}
  }

  // Prefer Sleeper record/PF/PA when available; fall back to projections for record/points
  const team = {
    division: proj?.division ?? '',
    wins: sleeper?.wins ?? proj?.wins ?? 0,
    losses: sleeper?.losses ?? proj?.losses ?? 0,
    ties: sleeper?.ties ?? proj?.ties ?? 0,
    points: sleeper?.pointsFor ?? proj?.points ?? 0,
    pointsFor: sleeper?.pointsFor ?? proj?.points ?? 0,
    pointsAgainst: sleeper?.pointsAgainst ?? null,
    divStatus: proj?.divStatus ?? '',
    playStatus: proj?.playStatus ?? '',
    odds: proj?.odds ?? { winDivision: null, makePlayoffs: null, winTitle: null }
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