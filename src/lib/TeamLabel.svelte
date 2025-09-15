<script>
  import { onMount } from "svelte";
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  export let slug = "";              // site team slug (e.g. "brute-force-attack")
  export let href = "";              // optional team link
  export let size = 26;              // avatar size in px

  let name = slug;                   // immediate fallback
  let logoUrl = "";                  // will be filled from roster or user

  // Find the matching manager record for this slug
  const mgr = Array.isArray(managers) ? managers.find((m) => m?.slug === slug) : null;
  // Prefer displaying your configured label right away
  if (mgr?.name) name = mgr.name;

  // --- helpers ---
  const asId = (v) => (v == null ? null : String(v));

  const sleeperAvatar = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  function pickLogo(teamObj = {}) {
    // Try all common fields we’ve seen in your codebase
    return (
      teamObj.logoUrl ||
      teamObj.avatarUrl ||
      teamObj.teamAvatar ||
      teamObj.logo ||
      teamObj.avatar ||
      ""
    );
  }

  function pickName(teamObj = {}, userObj = {}, fallback = "") {
    return (
      teamObj.displayName ||
      teamObj.teamName ||
      userObj.display_name ||
      userObj.user_name ||
      fallback
    );
  }

  function findRosterEntryByOwner(map = {}, ownerId) {
    if (!ownerId) return null;
    const target = asId(ownerId);
    for (const rid of Object.keys(map)) {
      const entry = map[rid];
      if (!entry) continue;
      const has =
        entry?.managers?.some((m) => asId(m?.user_id) === target || asId(m?.managerID) === target) ||
        asId(entry?.team?.owner_id) === target ||
        asId(entry?.team?.managerID) === target;
      if (has) return entry;
    }
    return null;
  }

  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers(); // same feed used by Standings
      const usersById = ltm?.users || {};
      const currentSeason = ltm?.currentSeason;
      const teamManagersMap = ltm?.teamManagersMap?.[currentSeason] || {};

      // Owner ID from your managers config (coerced to string)
      const ownerId = asId(mgr?.managerID);

      // 1) Prefer roster/team metadata (name + custom team logo)
      const re = findRosterEntryByOwner(teamManagersMap, ownerId);
      if (re?.team) {
        const candidateLogo = pickLogo(re.team);
        if (candidateLogo) logoUrl = candidateLogo;
        const candidateName = pickName(re.team, {}, name);
        if (candidateName) name = candidateName;
      }

      // 2) Fall back to Sleeper user avatar/name
      const u = ownerId ? usersById[ownerId] : null;
      if (u) {
        if (!logoUrl) logoUrl = sleeperAvatar(u.avatar);
        if (!name) name = pickName({}, u, slug);
      }
    } catch (err) {
      // Keep fallbacks; just log once for debugging in dev
      console.warn("TeamLabel: failed to enrich from Sleeper", err);
    }
  });
</script>

{#if href}
  <a class="teamlabel" href={href}>
    {#if logoUrl}<img class="avatar" src={logoUrl} alt={name} loading="lazy" style={`--sz:${size}px`} />{/if}
    <span class="name">{name}</span>
  </a>
{:else}
  <span class="teamlabel">
    {#if logoUrl}<img class="avatar" src={logoUrl} alt={name} loading="lazy" style={`--sz:${size}px`} />{/if}
    <span class="name">{name}</span>
  </span>
{/if}

<style>
.teamlabel { display:inline-flex; align-items:center; gap:8px; text-decoration:none; color:#4da6ff; font-weight:600; }
.teamlabel:hover { text-decoration:underline; }
.avatar {
  width: var(--sz, 26px);
  height: var(--sz, 26px);
  border-radius: 50%;
  object-fit: cover;
}
.name { line-height: 1; }
</style>
