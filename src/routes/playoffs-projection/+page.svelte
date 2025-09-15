<script>
  import { onMount } from "svelte";

  // server loader provides this (from +page.server.js)
  export let data;
  const { projections, sourceUrl, error } = data;

  // ----- Optional: your Sleeper join (can keep or remove) -----
  // If you’re not using the Sleeper helpers yet, you can comment this block out.
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  let ltm = null;
  let currentYear = null;
  let rosterMap = {};
  let usersById = {};
  let rows = [];

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

  function buildRows() {
    rows = projections.map((p) => {
      const slug = p.slug || p.teamId || p.teamSlug || "";
      const ownerId = slugToOwnerId[slug];

      let displayName = slug;
      let logo = "";
      let href = slug ? `/team/${slug}` : "#";

      if (ownerId && usersById[ownerId]) {
        const user = usersById[ownerId];
        displayName = user.display_name || user.user_name || displayName;
        logo = avatarUrl(user.avatar) || logo;
      }

      const rosterEntry = ownerId ? findRosterEntryByOwner(ownerId) : null;
      if (rosterEntry?.team) {
        displayName =
          rosterEntry.team.displayName ||
          rosterEntry.team.teamName ||
          displayName;
        logo =
          rosterEntry.team.logoUrl ||
          rosterEntry.team.avatarUrl ||
          logo;
      }

      return { ...p, slug, name: displayName, logoUrl: logo, href };
    });
  }

  onMount(async () => {
    try {
      ltm = await getLeagueTeamManagers();
      currentYear = ltm?.currentSeason ?? null;
      rosterMap = (ltm?.teamManagersMap && currentYear)
        ? (ltm.teamManagersMap[currentYear] || {})
        : {};
      usersById = ltm?.users || {};
    } catch (e) {
      console.error("getLeagueTeamManagers failed:", e);
      ltm = null; rosterMap = {}; usersById = {};
    } finally {
      buildRows();
    }
  });

  // keep your visual sort after paint
  onMount(() => {
    const tbody = document.querySelector(".overlay table tbody");
    if (!tbody) return;

    const dvOrder = ["N", "E", "W", "S"];
    const getDivStatus = (text) => {
      const match = text.match(/:\s*([\d.]+)%/);
      return match ? parseFloat(match[1]) : -Infinity;
    };

    const sortRows = () => {
      const rowsEls = Array.from(tbody.querySelectorAll("tr"));
      rowsEls.sort((a, b) => {
        const dvA = a.cells[0].textContent.trim();
        const dvB = b.cells[0].textContent.trim();
        const dvCmp = dvOrder.indexOf(dvA) - dvOrder.indexOf(dvB);
        if (dvCmp !== 0) return dvCmp;
        const dsA = getDivStatus(a.cells[4].textContent);
        const dsB = getDivStatus(b.cells[4].textContent);
        return dsB - dsA;
      });
      rowsEls.forEach((r) => tbody.appendChild(r));
    };

    setTimeout(sortRows, 0);
  });
</script>

<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium2.jpg" alt="Stadium2" />
  <h2 class="title">Playoffs AI Analysis</h2>

  <div class="overlay">
    {#if error}
      <p class="text-red-500">Error loading projections: {error}</p>
    {/if}

    <!-- Debug: shows the exact URL being used -->
    <div class="mb-2 text-xs opacity-70">
      Source: {data?.sourceUrl}
    </div>

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

    <div class="legend">
      <strong>LEGEND:</strong><br />
      Status C = Clinch %<br />
      T = % that will end up in a tiebreak not resolved yet<br />
      mIn = Wins needed for any chance<br />
      Target = Projected Wins needed<br />
      gIn = Wins that should guarantee a spot (if any then Controls Own Destiny)<br /><br />
      <em>
        Due to many remaining games the analysis incorporated some randomization methods. 
        The accuracy of status, odds, targets, and 'paths' will depend on the depth of analysis 
        as well as the number of remaining games.
      </em>
    </div>
  </div>
</div>

<style>
.image-wrapper { position: relative; max-width: 900px; margin: 0.5rem auto; }
.image-wrapper img { display: block; width: 100%; border-radius: 8px; }
.title { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); font-weight: bold; font-size: clamp(1.6rem, 3.6vw, 2.2rem); margin: 0; white-space: nowrap; color: white; text-shadow: 1px 1px 4px rgba(0,0,0,0.8); }
.overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(97%, 880px); max-height: 70%; overflow: auto; padding: 0.25rem 0.5rem; background: rgba(0,0,0,0.4); border-radius: 6px; }
.overlay table { width: 100%; border-collapse: collapse; font-size: 0.75rem; line-height: 1rem; }
.overlay th, .overlay td { padding: 2px 4px; text-align: center; white-space: nowrap; }
.overlay th { background: rgba(0,0,0,0.6); color: white; }
.overlay td { color: white; border-bottom: 1px solid rgba(255,255,255,0.12); }
.overlay td:first-child, .overlay td:nth-child(2) { text-align: left; }
.overlay a { color: #4da6ff; font-weight: bold; text-decoration: none; }
.overlay a:hover { text-decoration: underline; }
.teamcell { display:flex; align-items:center; gap:6px; }
.logo { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; vertical-align: middle; }
.legend { margin-top: 0.5rem; font-size: 0.7rem; line-height: 1rem; color: white; text-align: left; }
.legend strong { color: #ffd966; }
.legend em { color: #ddd; font-size: 0.65rem; }
</style>
