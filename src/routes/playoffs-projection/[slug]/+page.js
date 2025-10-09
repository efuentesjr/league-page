import { error } from '@sveltejs/kit';
import { PUBLIC_PROJECTIONS_URL } from '$env/static/public';

const slugFrom = (s) =>
  s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const load = async ({ params, fetch }) => {
  const { slug } = params;

  const res = await fetch(PUBLIC_PROJECTIONS_URL);
  if (!res.ok) throw error(500, 'Failed to load projections JSON');

  const all = await res.json();
  const team = all.find((t) => slugFrom(t.team) === slug);
  if (!team) throw error(404, 'Team not found in projections');

  return {
    slug,
    team,
    // we’ll use this in a later step for avatar fallback
    avatarBasePath: '/playoffs-projection/avatars'
  };
};
