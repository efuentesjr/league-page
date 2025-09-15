<script>
  import { onMount } from "svelte";

  // data from +page.server.js (already fetching from R2 server-side)
  export let data;
  const { projections, error } = data;

  // Sleeper helpers (same ones your Standings page uses)
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  let ltm = null;
  let currentYear = null;
  let rosterMap = {};
  let usersById = {};
  let rows = [];

  // Map slug -> ownerId from your managers config (if present)
  const slugToOwnerId = {};
  if (Array.isArray(managers)) {
    for (const m of managers) {
      if (m?.slug && m?.managerID) slugToOwnerId[m.slug] = m.managerID;
    }
  }

  const avatarUrl = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  function findRosterEntryByOwner(ownerId) {
    for (const rid of Object.keys(rosterMap)) {
      const entry = rosterMap[rid];
      if (entry?.managers && Array.isArray(entry.managers)) {
        if (entry.managers.some((m) => m?.user_id === ownerId || m?.managerID === ownerId)) {
          return entry;
        }
      }
      if (entry?.team?.owner_id === ownerId || entry?.team?.managerID === ownerId) {
        return entry;
      }
    }
    return null;
  }

  // Parse "C:41.8% T:17.2%" -> { c: 41.8, t: 17.2 }
  function parsePlayStatus(s) {
    if (!s) return { c: -Infinity, t: -Infinity };
    const c = Number((s.match(/C:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    const t = Number((s.match(/T:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    return { c, t };
  }

  // Build final rows:
  // 1) start with projections so we always render immediately
  // 2) enrich with Sleeper names/logos
  // 3) add any teams missing from projections (from managers/Sleeper)
  // 4) sort by PlaySTATUS (C% desc, T% desc)
  function buildRows() {
    // index projections by slug for quick lookup
    const projBySlug = new Map(
      (projections || []).filter(p => p?.slug).map(p => [p.slug, p])
    );

    // 1) start with projections
    rows = (projections || [])
      .filter(p => p?.slug)
      .map((p) => ({
        slug: p.slug,
        division: p.division ?? "",
        wins: p.wins ?? 0,
        losses: p.losses ?? 0,
        ties: p.ties ?? 0,
        points: p.points ?? 0,
        divStatus: p.divStatus ?? "",
        playStatus: p.playStatus ?? "",
        min: p.min ?? "",
        targets: p.targets ?? "",
        gIn: p.gIn ?? "",
        divTgts: p.divTgts ?? "",
        name: p.slug,            // will be replaced by Sleeper if available
        logoUrl: "",
        href: p.slug ? `/team/${p.slug}` : "#"
      }));

    // 2) enrich existing rows with Sleeper names/avatars when available
    rows = rows.map((r) => {
      const ownerId = slugToOwnerId[r.slug];
      if (ownerId && usersById[ownerId]) {
        const u = usersById[ownerId];
        r.name = u.display_name || u.user_name || r.name;
        r.logoUrl = avatarUrl(u.avatar) || r.logoUrl;
      }
      const re = ownerId ? findRosterEntryByOwner(ownerId) : null;
      if (re?.team) {
        r.name = re.team.displayName || re.team.teamName || r.name;
        r.logoUrl = re.team.logoUrl || re.team.avatarUrl || r.logoUrl;
      }
      return r;
    });

    // 3) add any teams missing from projections (from managers list)
    const seen = new Set(rows.map(r => r.slug));
    if (Array.isArray(managers)) {
      for (const m of managers) {
        const slug = m?.slug;
        if (!slug || seen.has(slug)) continue;

        // empty projections row, enriched by Sleeper if possible
        let name = slug;
        let logoUrl = "";
        const href = `/team/${slug}`;
        const ownerId = slugToOwnerId[slug];

        if (ownerId && usersById[ownerId]) {
          const u = usersById[ownerId];
          name = u.display_name || u.user_name || name;
          logoUrl = avatarUrl(u.avatar) || logoUrl;
        }
        const re = ownerId ? findRosterEntryByOwner(ownerId) : null;
        if (re?.team) {
          name = re.team.displayName || re.team.teamName || name;
          logoUrl = re.team.logoUrl || re.team.avatarUrl || logoUrl;
        }

        rows.push({
          slug, division: "", wins: 0, losses: 0, ties: 0, points: 0,
          divStatus: "", playStatus: "", min: "", targets: "", gIn: "", divTgts: "",
          name, logoUrl, href
        });
      }
    }

    // 4) sort by PlaySTATUS → C% desc, then T% desc
    rows.sort((a, b) => {
      const A = parsePlayStatus(a.playStatus);
      const B = parsePlayStatus(b.playStatus);
      if (B.c !== A.c) return B.c - A.c;
      if (B.t !== A.t) return B.t - A.t;
      return (a.name || "").localeCompare(b.name || "");
    });
  }

  // Build immediately (so projections show even before Sleeper returns)
  buildRows();

  // Then load Sleeper & rebuild to enrich / add missing teams
  onMount(async () => {
    try {
      ltm = await getLeagueTeamManagers();
      currentYear = ltm?.currentSeason ?? null;
      rosterMap = (ltm?.teamManagersMap && currentYear)
        ? (ltm.teamManagersMap[currentYear] || {})
        : {};
      usersById = ltm?.users || {};
    } catch (e) {
      console.warn("getLeagueTeamManagers failed:", e);
      ltm = null; rosterMap = {}; usersById = {};
    } finally {
      buildRows();
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
        {#each rows as r (r.slug)}
          <tr>
            <td>{r.division}</td>
            <td class="teamcell">
              <a href={r.href}>
                {#if r.logoUrl}<img class="logo" src={r.logoUrl} alt={r.name} loading="lazy" />{/if}
                {r.name || r.slug}
              </a>
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
