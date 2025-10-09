import { PUBLIC_PROJECTIONS_URL } from '$env/static/public';

const slugFrom = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const load = async ({ params, fetch }) => {
  const { slug } = params;
  const url = PUBLIC_PROJECTIONS_URL;

  // If the env var didn’t make it into this build/page, show it plainly.
  if (!url) {
    return {
      slug,
      debug: {
        havePublicEnv: false,
        message: 'PUBLIC_PROJECTIONS_URL is undefined in this route.'
      }
    };
  }

  try {
    const res = await fetch(url);
    const ok = res.ok;
    let status = res.status;
    let text = '';
    if (!ok) {
      // capture body text for visibility (often says 403/404/etc)
      try { text = await res.text(); } catch { /* ignore */ }
      return { slug, url, debug: { havePublicEnv: true, ok, status, text } };
    }

    const all = await res.json();
    const team = all.find((t) => slugFrom(t.team) === slug);

    if (!team) {
      return { slug, url, debug: { havePublicEnv: true, ok: true, status, text: 'Team not found in JSON.' } };
    }

    return {
      slug,
      url,
      team,
      avatarBasePath: '/playoffs-projection/avatars'
    };
  } catch (e) {
    return {
      slug,
      url,
      debug: { havePublicEnv: true, ok: false, status: 'network/error', text: String(e) }
    };
  }
};

