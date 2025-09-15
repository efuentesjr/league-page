export const prerender = false;

import { env } from '$env/dynamic/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) {
    return { projections: [], sourceUrl: url, error: 'Missing PUBLIC_PROJECTIONS_URL' };
  }

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return { projections: [], sourceUrl: url, error: `Fetch failed: ${res.status}` };
    }

    const projections = await res.json();
    setHeaders({ 'cache-control': 'no-store' });
    return { projections, sourceUrl: url, error: null };
  } catch (e) {
    return { projections: [], sourceUrl: url, error: String(e) };
  }
}
