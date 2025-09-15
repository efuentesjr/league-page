<script>
  import { onMount } from "svelte";

  // data from +page.server.js
  export let data;
  const { projections, sourceUrl, error } = data;

  // ----- OPTIONAL Sleeper join (kept, but we’ll also render a fallback) -----
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  let ltm = null;
  let currentYear = null;
  let rosterMap = {};
  let usersById = {};
  let rows = [];

  // map: slug -> ownerId (based on your managers config)
  const slugToOwnerId = {};
  if (Array.isArray(managers)) {
    for (const m of managers) {
      if (m?.slug && m?.managerID) slugToOwnerId[m.slug] = m.managerID;
    }
  }

  const avatarUrl = (avatarId) => (avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "");

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

  // Build rows from projections + (if available) Sleeper live data
  function buildRows() {
    // Start with a direct mapping from projections so we always render something
    rows = projections.map((p) => ({
      ...p,
      slug: p.slug || p.teamId || p.teamSlug || "",
      name: p.teamName || p.slug || "",
      logoUrl: "",
      href: p.slug ? `/team/${p.slug}` : "#"
    }));

    // If we have Sleeper data, enrich names/logos
    if (Object.keys(slugToOwnerId).length && Object.keys(usersById).length) {
      rows = rows.map((r) => {
        const ownerId = slugToOwnerId[r.slug];
        let name = r.name;
        let logo = r.logoUrl;

        if (ownerId && usersById[ownerId]) {
          const user = usersById[ownerId];
          name = user.display_name || user.user_name || name;
          logo = avatarUrl(user.avatar) || logo;
        }

        const rosterEntry = ownerId ? findRosterEntryByOwner(ownerId) : null;
        if (rosterEntry?.team) {
          name = rosterEntry.team.displayName || rosterEntry.team.teamName || name;
          logo = rosterEntry.team.logoUrl || rosterEntry.team.avatarUrl || logo;
        }

        return { ...r, name, logoUrl: logo };
      });
    }
  }

  onMount(async () => {
    try {
      // load Sleeper data (same pipeline the standings page uses)
      ltm = await getLeagueTeamManagers();
      currentYear = ltm?.currentSeason ?? null;
      rosterMap = (ltm?.teamManagersMap && currentYear) ? (ltm.teamManagersMap[currentYear] || {}) : {};
      usersById = ltm?.users || {};
    } catch (e) {
      console.warn("getLeagueTeamManagers failed:", e);
      ltm = null; rosterMap = {}; usersById = {};
    } finally {
      buildRows();
    }
  });

  // Keep your original visual sort after paint
  onMount(() => {
    const tbody = document.querySelector(".overlay table tbody");
    if (!tbody) return;

    const dvOrder = ["N", "E", "W", "S"];
    const getDivStatus = (text) => {
      const match = text.match(/:\s*([\d.]+)%/);
      return match ? parseFloat(match[1]) : -Infinity;
    };

    const sortRows = () => {
      const els = Array.from(tbody.querySelectorAll("tr"));
      els.sort((a, b) => {
        const dvA = a.cells[0]?.textContent.trim() || "";
        const dvB = b.cells[0]?.textContent.trim() || "";
        const dvCmp = dvOrder.indexOf(dvA) - dvOrder.indexOf(dvB);
        if (dvCmp !== 0) return dvCmp;
        const dsA = getDivStatus(a.cells[4]?.textContent || "");
        const dsB = getDivStatus(b.cells[4]?.textContent || "");
        return dsB - dsA;
      });
      els.forEach((r) => tbody.appendChild(r));
    };

    setTimeout(sortRows, 0);
  });
</script>

<!-- No background image; simple dark container -->
<div class="image-wrapper">
  <h2 class="title">Playoffs AI Analysis</h2>

  <div class="overlay">
    {#if error}
      <p class="text-red-500">Error loading projections: {error}</p>
    {/if}

    <!-- DEBUG: keep for now -->
    <div class="mb-2 text-xs opacity-70">
      <div><b>Source:</b> {data?.sourceUrl}</div>
      <div><b>Loaded rows:</b> {rows?.length ?? 0}</div>
    </div>
    <pre class="debug-json">{JSON.stringify(projections, null, 2)}</pre>

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
.image-wrapper { position: relative; max-width: 980px; margin: 1rem auto; background: #111; padding: 1rem 0 2rem; border-radius: 10px; }
.title { text-align: center; font-weight: 800; font-size: clamp(1.6rem, 3.6vw, 2.2rem); color: #fff; margin: 0 0 0.5rem; text-shadow: 1px 1px 4px rgba(0,0,0,0.6); }
.overlay { width: min(97%, 920px); margin: 0 auto; max-height: 70vh; overflow: auto; padding: 0.5rem; background: rgba(0,0,0,0.35); border-radius: 8px; }
.overlay table { width: 100%; border-collapse: collapse; font-size: 0.8rem; line-height: 1.1rem; }
.overlay th, .overlay td { padding: 4px 6px; text-align: center; white-space: nowrap; }
.overlay th { background: rgba(0,0,0,0.55); color: white; position: sticky; top: 0; z-index: 1; }
.overlay td { color: white; border-bottom: 1px solid rgba(255,255,255,0.12); }
.overlay td:first-child, .overlay td:nth-child(2) { text-align: left; }
.overlay a { color: #4da6ff; font-weight: 600; text-decoration: none; }
.overlay a:hover { text-decoration: underline; }
.teamcell { display:flex; align-items:center; gap:6px; }
.logo { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; vertical-align: middle; }
.legend { margin-top: 0.6rem; font-size: 0.75rem; line-height: 1.05rem; color: white; text-align: left; }
.legend strong { color: #ffd966; }
.legend em { color: #ddd; font-size: 0.7rem; }
.debug-json { font-size: 0.65rem; max-height: 160px; overflow: auto; color: #eaeaea; background: rgba(0,0,0,0.35); padding: 6px; border-radius: 6px; margin: 0 0 8px; }
</style>
