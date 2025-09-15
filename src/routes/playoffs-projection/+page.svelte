<script>
  import { onMount } from "svelte";

  // From +page.server.js (R2 fetch, no CORS issues)
  export let data;
  const { projections, error } = data;

  // Sleeper helpers (same as Standings)
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  // State
  let ltm = null;
  let currentYear = null;
  let rosterMap = {};   // roster_id -> { team, managers }
  let usersById = {};   // user_id -> user
  let rows = [];

  // -------- helpers ----------
  const slugify = (s = "") =>
    s.toString().trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const avatarUrl = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  function primaryOwnerId(entry) {
    // try managers[0].user_id, then team.owner_id, then team.managerID
    return (
      entry?.managers?.[0]?.user_id ??
      entry?.team?.owner_id ??
      entry?.team?.managerID ??
      null
    );
  }

  // Parse "C:41.8% T:17.2%" -> { c:41.8, t:17.2 }
  function parsePlayStatus(s) {
    if (!s) return { c: -Infinity, t: -Infinity };
    const c = Number((s.match(/C:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    const t = Number((s.match(/T:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    return { c, t };
  }

  // Build a single display row given: slug, ownerId, projection patch
  function composeRow({ slug, ownerId, proj = {} }) {
    // projection fields with defaults
    const r = {
      slug,
      division: proj.division ?? "",
      wins: proj.wins ?? 0,
      losses: proj.losses ?? 0,
      ties: proj.ties ?? 0,
      points: proj.points ?? 0,
      divStatus: proj.divStatus ?? "",
      playStatus: proj.playStatus ?? "",
      min: proj.min ?? "",
      targets: proj.targets ?? "",
      gIn: proj.gIn ?? "",
      divTgts: proj.divTgts ?? "",
      name: proj.teamName || slug || "",
      logoUrl: "",
      href: slug ? `/team/${slug}` : "#"
    };

    // enrich from managers config (immediate nice label)
    if (slug && Array.isArray(managers)) {
      const m = managers.find((x) => x?.slug === slug);
      if (m?.name) r.name = m.name;
      if (!ownerId && m?.managerID) ownerId = m.managerID;
    }

    // enrich from Sleeper users
    if (ownerId && usersById[ownerId]) {
      const u = usersById[ownerId];
      r.name = u.display_name || u.user_name || r.name;
      r.logoUrl = avatarUrl(u.avatar) || r.logoUrl;
    }

    // enrich from roster entry team object (nicer teamName/logo)
    const re = findRosterEntryByOwner(ownerId);
    if (re?.team) {
      r.name = re.team.displayName || re.team.teamName || r.name;
      r.logoUrl = re.team.logoUrl || re.team.avatarUrl || r.logoUrl;
    }

    // if we still have no slug but we have a name, make a safe href-less row
    if (!r.slug && r.name) {
      r.href = "#";
    }

    return r;
  }

  function findRosterEntryByOwner(ownerId) {
    for (const rid of Object.keys(rosterMap)) {
      const entry = rosterMap[rid];
      if (!entry) continue;
      const pm = primaryOwnerId(entry);
      if (pm && pm === ownerId) return entry;
    }
    return null;
  }

  // ------- builders --------

  // Build rows from current rosters (best source of truth for "everyone")
  function buildFromRosters() {
    const projBySlug = new Map(
      (projections || []).filter(p => p?.slug).map(p => [p.slug, p])
    );

    const result = [];
    const usedSlugs = new Set();

    // 1) every roster in the current season
    for (const rid of Object.keys(rosterMap)) {
      const entry = rosterMap[rid];
      const ownerId = primaryOwnerId(entry);
      const user = ownerId ? usersById[ownerId] : null;

      // try to find slug in managers by managerID
      let slug = null;
      if (Array.isArray(managers) && ownerId) {
        const m = managers.find((x) => x?.managerID === ownerId);
        slug = m?.slug ?? null;
      }
      // fallback: slugify the user's display_name (still renders even w/o link)
      if (!slug && user) slug = slugify(user.display_name || user.user_name || "");

      const proj = slug ? (projBySlug.get(slug) || {}) : {};
      result.push(composeRow({ slug, ownerId, proj }));
      if (slug) usedSlugs.add(slug);
    }

    // 2) any leftover projections that didn't match a roster (e.g., off-season)
    for (const proj of projections || []) {
      if (!proj?.slug || usedSlugs.has(proj.slug)) continue;
      result.push(composeRow({ slug: proj.slug, ownerId: null, proj }));
    }

    return sortRows(result);
  }

  // Fallback: build from projections only (used before rosters are loaded)
  function buildFromProjectionsOnly() {
    const result = (projections || [])
      .filter((p) => p?.slug)
      .map((p) => composeRow({ slug: p.slug, ownerId: null, proj: p }));
    return sortRows(result);
  }

  function sortRows(arr) {
    // Sort by PlaySTATUS -> C% desc, then T% desc
    arr.sort((a, b) => {
      const A = parsePlayStatus(a.playStatus);
      const B = parsePlayStatus(b.playStatus);
      if (B.c !== A.c) return B.c - A.c;
      if (B.t !== A.t) return B.t - A.t;
      return (a.name || "").localeCompare(b.name || "");
    });
    return arr;
  }

  // Initial render: projections (so page is never empty)
  rows = buildFromProjectionsOnly();

  // After mount: pull Sleeper data and rebuild from rosters
  onMount(async () => {
    try {
      ltm = await getLeagueTeamManagers();
      currentYear = ltm?.currentSeason ?? null;
      rosterMap =
        (ltm?.teamManagersMap && currentYear && ltm.teamManagersMap[currentYear]) || {};
      usersById = ltm?.users || {};
    } catch (e) {
      console.warn("getLeagueTeamManagers failed:", e);
      rosterMap = {};
      usersById = {};
    } finally {
      // if we have rosters, switch to roster-based render (shows ALL teams)
      rows = Object.keys(rosterMap).length ? buildFromRosters() : buildFromProjectionsOnly();
    }
  });
</script>

<div class="wrap">
  <h2 class="title">Playoffs AI Analysis</h2>

  <div class="overlay">
    {#if error}
      <p class="text-red-500">Error loading projections: {error}</p>
    {/if}

    <table>
      <thead>
        <tr>
          <th>Dv</th>
          <th>Team</th>
          <th>W-L-T</th>
          <th>Pts</th>
          <th>DivSTATUS</th>
          <th>PlaySTATUS</th>
          <th>mIn</th>
          <th>Targets</th>
          <th>gIn</th>
          <th>DivTgts</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as r, i (r.slug || i)}
          <tr>
            <td>{r.division}</td>
            <td class="teamcell">
              {#if r.href && r.href !== "#"}
                <a href={r.href}>
                  {#if r.logoUrl}<img class="logo" src={r.logoUrl} alt={r.name} loading="lazy" />{/if}
                  {r.name}
                </a>
              {:else}
                {#if r.logoUrl}<img class="logo" src={r.logoUrl} alt={r.name} loading="lazy" />{/if}
                <span>{r.name}</span>
              {/if}
            </td>
            <td>{r.wins}-{r.losses}{#if r.ties && r.ties>0}-{r.ties}{/if}</td>
            <td>{r.points ?? 0}</td>
            <td>{r.divStatus ?? ""}</td>
            <td>{r.playStatus ?? ""}</td>
            <td>{r.min ?? ""}</td>
            <td>{r.targets ?? ""}</td>
            <td>{r.gIn ?? ""}</td>
            <td>{r.divTgts ?? ""}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
.wrap {
  position: relative;
  max-width: 980px;
  margin: 1rem auto;
  background: #111;
  padding: 1rem 0 2rem;
  border-radius: 10px;
}
.title {
  text-align: center;
  font-weight: 800;
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  color: #fff;
  margin: 0 0 0.5rem;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
}
.overlay {
  width: min(97%, 920px);
  margin: 0 auto;
  max-height: 70vh;
  overflow: auto;
  padding: 0.5rem;
  background: rgba(0,0,0,0.35);
  border-radius: 8px;
}
.overlay table { width: 100%; border-collapse: collapse; font-size: 0.8rem; line-height: 1.1rem; }
.overlay th, .overlay td { padding: 4px 6px; text-align: center; white-space: nowrap; }
.overlay th { background: rgba(0,0,0,0.55); color: white; position: sticky; top: 0; z-index: 1; }
.overlay td { color: white; border-bottom: 1px solid rgba(255,255,255,0.12); }
.overlay td:first-child, .overlay td:nth-child(2) { text-align: left; }
.overlay a { color: #4da6ff; font-weight: 600; text-decoration: none; }
.overlay a:hover { text-decoration: underline; }
.teamcell { display:flex; align-items:center; gap:6px; }
.logo { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; vertical-align: middle; }
</style>
