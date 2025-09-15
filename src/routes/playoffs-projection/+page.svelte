<script>
  import { onMount } from "svelte";

  // From +page.server.js (R2 fetch, no CORS)
  export let data;
  const { projections, error } = data;

  // Same helpers your Standings page uses
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  // state
  let usersById = {};
  let rows = [];

  // slug -> ownerId from your managers config
  const slugToOwnerId = {};
  if (Array.isArray(managers)) {
    for (const m of managers) {
      if (m?.slug && m?.managerID) slugToOwnerId[m.slug] = m.managerID;
    }
  }

  const avatarUrl = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  // Parse "C:41.8% T:17.2%" -> { c: 41.8, t: 17.2 }
  function parsePlayStatus(s) {
    if (!s) return { c: -Infinity, t: -Infinity };
    const c = Number((s.match(/C:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    const t = Number((s.match(/T:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    return { c, t };
  }

  function buildRows() {
    rows = (projections || [])
      .filter(p => p?.slug)
      .map(p => {
        const slug = p.slug;

        // base row from JSON
        let name = slug;
        let logoUrl = "";
        const href = `/team/${slug}`;

        // enrich name/avatar from Sleeper (if we can map slug -> owner)
        const ownerId = slugToOwnerId[slug];
        if (ownerId && usersById[ownerId]) {
          const u = usersById[ownerId];
          name = u.display_name || u.user_name || name;
          logoUrl = avatarUrl(u.avatar) || logoUrl;
        }

        return {
          slug,
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
          name, logoUrl, href
        };
      });

    // sort by PlaySTATUS: C% desc, then T% desc
    rows.sort((a, b) => {
      const A = parsePlayStatus(a.playStatus);
      const B = parsePlayStatus(b.playStatus);
      if (B.c !== A.c) return B.c - A.c;
      if (B.t !== A.t) return B.t - A.t;
      return (a.name || "").localeCompare(b.name || "");
    });
  }

  // initial build (JSON only, renders instantly)
  buildRows();

  // upgrade names/avatars from Sleeper once mounted
  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers();
      usersById = ltm?.users || {};
    } catch (e) {
      console.warn("getLeagueTeamManagers failed:", e);
      usersById = {};
    } finally {
      buildRows(); // rebuild to apply live names/avatars
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
                {r.name}
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
