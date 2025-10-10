import { error } from '@sveltejs/kit';
import { PUBLIC_PROJECTIONS_URL } from '$env/static/public';

const slugFrom = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

function getTeamName(obj) {
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

  let all = [];
  let source = '';

  // ---- Try #1: PUBLIC_PROJECTIONS_URL (R2)
  if (PUBLIC_PROJECTIONS_URL) {
    try {
      const res = await fetch(PUBLIC_PROJECTIONS_URL);
      if (res.ok) {
        all = coerceArray(await res.json());
        source = `env:${PUBLIC_PROJECTIONS_URL}`;
      } else {
        // fall through to next source
      }
    } catch {
      // fall through
    }
  }

  // ---- Try #2: static file (/static/projections-latest.json)
  if (!all.length) {
    try {
      const res2 = await fetch('/projections-latest.json');
      if (res2.ok) {
        all = coerceArray(await res2.json());
        source = 'static:/projections-latest.json';
      }
    } catch {
      // fall through
    }
  }

  // ---- Try #3: bundled file (src/lib/data/projections-latest.json)
  if (!all.length) {
    try {
      // import assertion works on the server
      const mod = await import('$lib/data/projections-latest.json', {
        assert: { type: 'json' }
      });
      all = coerceArray(mod.default);
      source = 'lib:$lib/data/projections-latest.json';
    } catch {
      // nothing left
    }
  }

  if (!all.length) {
    throw error(
      502,
      'Could not load projections from any source (env, static, or lib).'
    );
  }

  // Find the team
  const pairs = all
    .map((item) => {
      const name = getTeamName(item);
      return name ? { name, item } : null;
    })
    .filter(Boolean);

  const hit = pairs.find((p) => matchesSlug(p.name, slug));
  if (!hit) {
    const sample = pairs.slice(0, 10).map((p) => slugFrom(p.name));
    throw error(
      404,
      `Team not found in projections for slug "${slug}". Source: ${source}. `
        + `Sample slugs: ${sample.join(', ')}`
    );
  }

  const team = hit.item;

  return {
    slug,
    team,
    source, // <-- visible in the Svelte page if you want to show/debug it
    avatarBasePath: '/playoffs-projection/avatars'
  };
};
