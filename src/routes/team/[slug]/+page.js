// src/routes/team/[slug]/+page.js
export const load = async ({ params, fetch }) => {
  const slug = params.slug.toLowerCase();

  // Pretty title from slug (e.g., "brute-force" -> "Brute Force")
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Main banner image (adjust if you use a single shared image instead)
  const img = `/team/${slug}.jpg`; // or "/team/path.jpg"

  // Helper: normalize a name to slug (to match API names)
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  let logoUrl = "";

  // 1) Try a team list endpoint and find the matching team
  try {
    // Adjust this FIRST endpoint to the one you already use app-wide
    // e.g. "/api/teams", "/api/playoffs/teams", "/api/league/teams", etc.
    const listRes = await fetch(`/api/teams`);
    if (listRes.ok) {
      const payload = await listRes.json();
      const arr = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.teams)
        ? payload.teams
        : [];

      // Find by slug or by name
      const match =
        arr.find((t) => slugify(t.slug || t.id || t.code) === slug) ||
        arr.find((t) => slugify(t.name || t.team || t.display_name) === slug);

      if (match) {
        logoUrl =
          match.logoUrl ??
          match.logo_url ??
          match.logo ??
          match.badge ??
          match.emblem ??
          match.avatar ??
          match.icon ??
          (match.images && (match.images.logo || match.images.badge)) ??
          (match.assets && (match.assets.logo || match.assets.badge)) ??
          "";
      }
    }
  } catch {
    /* ignore and try detail endpoints next */
  }

  // 2) If still empty, try likely detail endpoints
  if (!logoUrl) {
    const detailCandidates = [
      `/api/teams/${slug}`,
      `/api/team/${slug}`,
      `/api/league/teams/${slug}`
    ];

    for (const url of detailCandidates) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const t = await res.json();
          logoUrl =
            t.logoUrl ??
            t.logo_url ??
            t.logo ??
            t.badge ??
            t.emblem ??
            t.avatar ??
            (t.images && (t.images.logo || t.images.badge)) ??
            (t.assets && (t.assets.logo || t.assets.badge)) ??
            "";
          if (logoUrl) break;
        }
      } catch {
        /* keep trying */
      }
    }
  }

  return { slug, title, img, logoUrl };
};
