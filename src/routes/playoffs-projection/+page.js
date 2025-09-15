export const prerender = false;
import { PUBLIC_PROJECTIONS_URL } from '$env/static/public';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const url = PUBLIC_PROJECTIONS_URL;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return { projections: [], sourceUrl: url, error: `Fetch failed: ${res.status}` };
    }
    const projections = await res.json();
    return { projections, sourceUrl: url, error: null };
  } catch (e) {
    return { projections: [], sourceUrl: url, error: String(e) };
  }
}
