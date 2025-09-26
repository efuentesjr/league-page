// src/routes/team/[slug]/+layout.js
import { managers } from '$lib/utils/leagueInfo';
import { env } from '$env/dynamic/public';

function prettifySlug(str = '') {
  return String(str)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Normalize minimal fields we show on the page
function normalizeRow(r) {
  // record "3-0-0" → wins/losses/ties
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = w ?? 0; losses = l ?? 0; ties = t ?? 0;
  } else {
    wins = r.wins ?? 0; losses = r.losses ?? 0; ties = r.ties ?? 0;
  }

  const division = r.division ?? r.Dv ?? '';
  const points   = Number(r.points ?? r.Pts ?? 0);
  const divStatus =
    r.divStatus ?? r.DivSTATUS ?? (r.status?.division ? `C:${r.status.division}` : '');
  const playStatus =
    r.playStatus ?? r.PlaySTATUS ??
    [
      r.status?.playoffs ? `C:${r.status.playoffs}` : '',
      r.status?.title ? `T:${r.status.title}` : ''
    ].filter(Boolean).join(' ');

  return { slug: r.slug, division, wins, losses, ties, points, divStatus, playStatus };
}

export async function load({ params, fetch }) {
  const { slug } = params;

  // Title from managers (teamName > name > prettified slug)
  const m = Array.isArray(managers) ? managers.find((x) => x.slug === slug) : null;
  const title =
    (m?.teamName || m?.team_name || m?.name || '').trim() || prettifySlug(slug);

  // Hero image you upload: static/team/<slug>.jpg
  const img = `/team/${slug}.jpg`;

  // Logo priority:
  // 1) optional CDN via PUBLIC_TEAM_LOGO_BASE → <base>/<slug>.png
  // 2) your local static/playoffs-projection/<slug>.png (client will fallback on <img on:error>)
  const cdnBase = (env.PUBLIC_TEAM_LOGO_BASE || '').replace(/\/$/, '');
  const logoFromCdn = cdnBase ? `${cdnBase}/${slug}.png` : '';
  const logoFromStatic = `/playoffs-projection/${slug}.png`;
  const logoUrl = logoFromCdn || logoFromStatic || '';

  // Pull this team’s row from the same projections URL
  const projectionsUrl = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  let team = null;

  if (projectionsUrl) {
    try {
      const res = await fetch(projectionsUrl, { cache: 'no-store' });
      if (res.ok) {
        const raw  = await res.json();
        const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const hit  = rows.find((r) => r.slug === slug);
        team = hit ? normalizeRow(hit) : null;
      }
    } catch {
      // no-op; show page without stats
    }
  }

  // Where your per-team fallback avatars/logos live (you said you use this folder)
  const avatarBasePath = '/playoffs-projection';

  return {
    title,
    img,
    logoUrl,
    team,
    avatarBasePath
  };
}