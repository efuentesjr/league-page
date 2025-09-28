// src/routes/team/[slug]/+page.server.js
import { env } from '$env/dynamic/public';

// parse "C:80.0% T:3.7%" -> { c: 80, t: 3.7 }
function parsePlayStatus(s = '') {
  const c = Number((s.match(/C:\s*([\d.]+)%/i) || [])[1] || 0);
  const t = Number((s.match(/T:\s*([\d.]+)%/i) || [])[1] || 0);
  return { c, t };
}

export async function load({ params, fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) return { status: 500, error: 'Missing PUBLIC_PROJECTIONS_URL' };

  const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
  if (!res.ok) return { status: res.status, error: `Fetch failed: ${res.status}` };

  const raw = await res.json();
  const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  // Find the matching team by slug (prefer r.slug if present; else map later in list page)
  const bySlug = rows.find((r) => r.slug && String(r.slug) === params.slug);

  // If your JSON doesn’t include r.slug, you can’t match here — instead,
  // rely on the list page to embed slug into each row before you host it.
  if (!bySlug) {
    return { status: 404, error: `Team not found for slug "${params.slug}"` };
  }

  // Build the fields your +page.svelte expects
  const title = bySlug.team || 'Team';
  const division = String(bySlug.division ?? '');
  const record = String(bySlug.record ?? '—');
  const pointsFor = Number.isFinite(bySlug.points) ? bySlug.points : null;

  // Bars: division/playoffs/title
  const divPct = Number((bySlug.status?.division || '0').toString().replace('%','')) || 0;
  const plyPct = Number((bySlug.status?.playoffs || '0').toString().replace('%','')) || 0;
  const ttlPct = Number((bySlug.status?.title || '0').toString().replace('%','')) || 0;

  // Targets
  const divisionTargets = bySlug.divisionTargets || '';
  const targets = bySlug.targets || '';
  const [minWins] = (targets || '').split('-');
  const [divMin, divMax] = (divisionTargets || '').split('-');

  setHeaders({ 'cache-control': 'no-store' });

  return {
    title,
    division,
    slug: params.slug,
    // optional custom logo path if you add one later:
    logoUrl: null,

    // Overview
    record,
    pointsFor,
    pointsAgainst: null,        // not in your JSON
    sosText: bySlug.sos?.past?.index
      ? (bySlug.sos.past.index > 1 ? 'Harder than avg' : 'Easier than avg')
      : '—',

    // Bars
    bars: {
      division: divPct,
      playoffs: plyPct,
      title: ttlPct
    },

    // Table details
    minWins: minWins || '—',
    maxWins: null,               // not provided
    playoffTargetWins: targets || '—',
    divisionTargetWins: divisionTargets || '—',

    // avatar base (optional)
    avatarBasePath: '/playoffs-projection/avatars'
  };
}
