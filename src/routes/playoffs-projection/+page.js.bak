export const prerender = false;
import { PUBLIC_PROJECTIONS_URL } from '$env/static/public';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  // 1) Trim to avoid hidden whitespace/newlines from the Vercel UI
  let url = (PUBLIC_PROJECTIONS_URL || '').trim();

  // 2) Optional one-line hardcode fallback for testing: uncomment to force it
  // url = 'https://pub-6c494cf1a4cf4239aacca464b2e210d2.r2.dev/projections-latest.json';

  if (!url) {
    return { projections: [], sourceUrl: url, error: 'Missing PUBLIC_PROJECTIONS_URL' };
  }

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
