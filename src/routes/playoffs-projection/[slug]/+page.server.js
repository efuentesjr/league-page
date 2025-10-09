import { error } from '@sveltejs/kit';
import { PUBLIC_PROJECTIONS_URL } from '$env/static/public';

const slugFrom = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const load = async ({ params, fetch }) => {
  const { slug } = params;
  const url = PUBLIC_PROJECTIONS_URL;
  if (!url) throw error(500, 'PUBLIC_PROJECTIONS_URL is undefined');

  // Server-side fetch avoids CORS
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw error(502, `Projections fetch failed: ${res.status} ${text}`);
  }

  const all = await res.json();
  const team = all.find((t) => slugFrom(t.team) === slug);
  if (!team) throw error(404, 'Team not found in projections');

  return {
    slug,
    team,
    avatarBasePath: '/playoffs-projection/avatars'
  };
};

// Ensure this route isn’t statically prerendered
export const prerender = false;
