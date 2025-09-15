<script>
  import { onMount } from "svelte";
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  export let slug = "";              // site team slug (e.g. "do-it-to-them")
  export let href = "";              // optional team link
  export let size = 26;              // avatar size (px)
  export let debug = false;          // <- turn on to log diagnostics

  let name = slug;                   // immediate fallback
  let logoUrl = "";                  // will be filled from roster or user

  // ----- helpers -----
  const asId = (v) => (v == null ? null : String(v));
  const sleeperAvatar = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  // Try all likely team-logo fields
  function pickLogo(team = {}) {
    return (
      team.logoUrl ||
      team.avatarUrl ||
      team.teamAvatar ||
      team.logo ||
      team.avatar ||
      ""
    );
  }

  // If no obvious logo field, hunt for any URL-looking string in the team object
  function huntLogoUrl(obj) {
    try {
      const seen = new Set();
      const stack = [obj];
      while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
        seen.add(cur);
        for (const k of Object.keys(cur)) {
          const v = cur[k];
          if (typeof v === "string") {
            if (/^https?:\/\//i.test(v) && /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(v)) return v;
          } else if (typeof v === "object") {
            stack.push(v);
          }
        }
      }
    } catch {}
    return "";
  }

  function pickName(team = {}, user = {}, fallback = "") {
    return (
      team.displayName ||
      team.teamName ||
      user.display_name ||
      user.user_name ||
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

  // Manager mapping for this slug (from your config)
  const mgr = Array.isArray(managers) ? managers.find((m) => m?.slug === slug) : null;
  if (mgr?.name) name = mgr.name;
  const ownerId = asId(mgr?.managerID);

  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers(); // same pipeline as Standings
      const usersById = ltm?.users || {};
      const currentSeason = ltm?.currentSeason;
      const teamManagersMap = ltm?.teamManagersMap?.[currentSeason] || {};

      // 1) Prefer roster/team metadata (name + custom team logo)
      const re = findRosterEntryByOwner(teamManagersMap, ownerId);
      const teamObj = re?.team || null;

      if (teamObj) {
        let candidateLogo = pickLogo(teamObj);
        if (!candidateLogo) candidateLogo = huntLogoUrl(teamObj);
        if (candidateLogo) logoUrl = candidateLogo;

        const candidateName = pickName(teamObj, {}, name);
        if (candidateName) name = candidateName;
      }

      // 2) Fall back to Sleeper user avatar/name
      const u = ownerId ? usersById[ownerId] : null;
      if (u) {
        if (!logoUrl) logoUrl = sleeperAvatar(u.avatar);
        if (!name) name = pickName({}, u, slug);
      }

      if (debug) {
        // Emit a concise diagnostic for this slug
        console.log("[TeamLabel]", {
          slug,
          ownerId,
          gotUsers: Object.keys(usersById).length,
          hasUser: !!(ownerId && usersById[ownerId]),
          rosterFound: !!re,
          teamKeys: teamObj ? Object.keys(teamObj) : [],
          chosenLogo: logoUrl,
          chosenName: name,
          userAvatarId: ownerId && usersById[ownerId] ? usersById[ownerId].avatar : null
        });
      }
    } catch (err) {
      if (debug) console.warn("TeamLabel: failed to enrich from Sleeper", { slug, err });
      // keep fallbacks
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
