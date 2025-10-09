import { error } from '@sveltejs/kit';
import { PUBLIC_PROJECTIONS_URL } from '$env/static/public';

const slugFrom = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

function getTeamName(obj) {
  // Be liberal about possible field names
  return (
    obj?.team ??
    obj?.Team ??
    obj?.teamName ??
    obj?.TeamName ??
    obj?.name ??
    obj?.title ??
    null
  );
}

function coerceArray(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.teams)) return json.teams;
  if (Array.isArray(json?.rows)) return json.rows;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

function matchesSlug(teamName, slug) {
  const a = slugFrom(teamName);
  const b = slug;
  if (a === b) return true;
  if (a.startsWith(b) || b.startsWith(a)) return true;
  const na = norm(teamName);
  const nb = norm(slug);
  return na.includes(nb) || nb.includes(na);
}

export const prerender = false;

export const load = async ({ params, fetch }) => {
  const { slug } = params;
  const url = PUBLIC_PROJECTIONS_URL;
  if (!url) throw error(500, 'PUBLIC_PROJECTIONS_URL is undefined');

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw error(502, `Projections fetch failed: ${res.status} ${text}`);
  }

  const raw = await res.json();
  const all = coerceArray(raw);

  // Map to {name, item} pairs using the first name-like field we can find
  const pairs = all
    .map((item) => {
      const name = getTeamName(item);
      return name ? { name, item } : null;
    })
    .filter(Boolean);

  // Try to match
  const hit = pairs.find((p) => matchesSlug(p.name, slug));

  if (!hit) {
    // Build a short debug payload to show what we actually received
    const sample = pairs.slice(0, 10).map((p) => ({
      name: p.name,
      slug: slugFrom(p.name)
    }));
    const keysFirst = Object.keys(all?.[0] ?? {});
    throw error(
      404,
      `Team not found in projections. Searched slug "${slug}". ` +
        `JSON items: ${all.length}. First item keys: ${keysFirst.join(', ') || '(none)'}.\n` +
        `Sample computed slugs: ${sample.map((s) => s.slug).join(', ') || '(no names found)'}`
    );
  }

  const team = hit.item;

  return {
    slug,
    team, // whatever shape the item has—we’ll read fields on the Svelte page next step
    avatarBasePath: '/playoffs-projection/avatars'
  };
};
