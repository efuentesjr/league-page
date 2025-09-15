<script>
  import { onMount } from "svelte";
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  export let slug = "";              // team slug used across your site
  export let href = "";              // optional link (e.g., `/team/${slug}`)

  let name = slug;                   // fallback until Sleeper loads
  let logoUrl = "";                  // fallback none

  // look up managerID for this slug from your managers config
  const mgr = Array.isArray(managers)
    ? managers.find((m) => m?.slug === slug)
    : null;
  const ownerId = mgr?.managerID ?? null;

  // immediate label: use managers[].name if present
  if (mgr?.name) name = mgr.name;

  const avatarUrl = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  // find the roster entry for an ownerId in the teamManagersMap
  function findRosterEntryByOwner(teamManagersMap, ownerId) {
    for (const rid of Object.keys(teamManagersMap || {})) {
      const entry = teamManagersMap[rid];
      if (!entry) continue;
      const hasOwner =
        entry?.managers?.some((m) => m?.user_id === ownerId || m?.managerID === ownerId) ||
        entry?.team?.owner_id === ownerId ||
        entry?.team?.managerID === ownerId;
      if (hasOwner) return entry;
    }
    return null;
  }

  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers(); // same feed as Standings
      const usersById = ltm?.users || {};
      const currentSeason = ltm?.currentSeason;
      const teamManagersMap = ltm?.teamManagersMap?.[currentSeason] || {};

      // 1) prefer roster's team displayName/logo (matches Standings)
      if (ownerId) {
        const re = findRosterEntryByOwner(teamManagersMap, ownerId);
        if (re?.team) {
          name = re.team.displayName || re.team.teamName || name;
          logoUrl = re.team.logoUrl || re.team.avatarUrl || logoUrl;
        }
      }

      // 2) fall back to user display_name + avatar (also like Standings)
      if (ownerId && usersById[ownerId]) {
        const u = usersById[ownerId];
        if (!logoUrl) logoUrl = avatarUrl(u.avatar);
        if (!name) name = u.display_name || u.user_name || name;
      }
    } catch (e) {
      // keep fallbacks
      console.warn("TeamLabel load failed:", e);
    }
  });
</script>

{#if href}
  <a class="teamlabel" href={href}>
    {#if logoUrl}<img class="avatar" src={logoUrl} alt={name} loading="lazy" />{/if}
    <span class="name">{name}</span>
  </a>
{:else}
  <span class="teamlabel">
    {#if logoUrl}<img class="avatar" src={logoUrl} alt={name} loading="lazy" />{/if}
    <span class="name">{name}</span>
  </span>
{/if}

<style>
.teamlabel { display:inline-flex; align-items:center; gap:8px; text-decoration:none; color:#4da6ff; font-weight:600; }
.teamlabel:hover { text-decoration:underline; }
.avatar { width:26px; height:26px; border-radius:50%; object-fit:cover; }
.name { line-height:1; }
</style>
