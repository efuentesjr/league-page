<script>
  import { onMount } from "svelte";
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  export let slug = "";      // site team slug (e.g., "do-it-to-them")
  export let href = "";      // optional team link
  export let size = 26;      // avatar size in px
  export let debug = false;  // turn on to log diagnostics

  let name = slug;           // we will try to replace this with the roster's team name
  let logoUrl = "";          // try roster/team logo first; fall back to user avatar
  let matchedBy = "none";    // debug info

  // ---------- helpers ----------
  const asId = (v) => (v == null ? null : String(v));
  const sleeperAvatar = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  function mkSlug(str) {
    return (str || "")
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

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
            if (/^https?:\/\//i.test(v) && /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(v)) {
              return v;
            }
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

  function findRosterEntryBySlug(map = {}, usersById = {}, wantedSlug) {
    for (const rid of Object.keys(map)) {
      const entry = map[rid];
      if (!entry) continue;

      const t = entry.team || {};
      const teamCandidates = [t.displayName, t.teamName].filter(Boolean);

      for (const m of entry.managers || []) {
        const uid = asId(m?.user_id || m?.managerID);
        if (uid && usersById[uid]) {
          teamCandidates.push(usersById[uid].display_name, usersById[uid].user_name);
        }
      }

      const slugs = teamCandidates.filter(Boolean).map(mkSlug);
      if (slugs.includes(wantedSlug)) return entry;
    }
    return null;
  }

  // Managers config for this slug (IF you added slug + managerID there)
  const mgr = Array.isArray(managers) ? managers.find((m) => m?.slug === slug) : null;
  // DO NOT set name = mgr.name here (that caused manager names to show in the Team column)
  const forcedOwnerId = asId(mgr?.managerID);
  // optional friendly fallback team name if you decide to add it in leagueInfo
  const configuredTeamName = mgr?.teamName ?? null;

  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers();
      const usersById = ltm?.users || {};
      const currentSeason = ltm?.currentSeason;
      const teamManagersMap = ltm?.teamManagersMap?.[currentSeason] || {};
      const gotRosters = Object.keys(teamManagersMap).length;

      let re = null;
      let teamObj = null;

      // Path A: exact owner match from managers[] (if you configured managerID for this slug)
      if (forcedOwnerId) {
        re = findRosterEntryByOwner(teamManagersMap, forcedOwnerId);
        if (re) {
          matchedBy = "ownerId";
          teamObj = re.team || {};
        }
      }

      // Path B: slugify roster/team names and match to our page slug
      if (!re) {
        re = findRosterEntryBySlug(teamManagersMap, usersById, slug);
        if (re) {
          matchedBy = "slugified-name";
          teamObj = re.team || {};
        }
      }

      // Prefer roster team logo/name
      if (teamObj) {
        const candidateLogo = pickLogo(teamObj) || huntLogoUrl(teamObj);
        if (candidateLogo) logoUrl = candidateLogo;

        const candidateName = pickName(teamObj, {}, name);
        if (candidateName) name = candidateName;
      }

      // Path C: match slug to ANY user display_name/user_name
      if (!logoUrl || !name || name === slug) {
        let matchedUser = null;
        for (const uid of Object.keys(usersById)) {
          const u = usersById[uid];
          const uSlugs = [u.display_name, u.user_name].filter(Boolean).map(mkSlug);
          if (uSlugs.includes(slug)) { matchedUser = u; break; }
        }
        if (matchedUser) {
          matchedBy = matchedBy === "none" ? "user-slug" : matchedBy + "+user-slug";
          if (!logoUrl) logoUrl = sleeperAvatar(matchedUser.avatar);
          if (!name || name === slug) name = pickName({}, matchedUser, name || slug);
        }
      }

      // FINAL FORCED FALLBACKS:
      // If you configured managerID but still don't have a logo, use the user's avatar
      if (!logoUrl && forcedOwnerId && usersById[forcedOwnerId]) {
        logoUrl = sleeperAvatar(usersById[forcedOwnerId].avatar);
        matchedBy = matchedBy === "none" ? "forced-managerID" : matchedBy + "+forced-managerID";
      }

      // If we still don't have a decent name, prefer configured teamName (if you add it), else prettify slug
      if (!name || name === slug) {
        const maybeUser = forcedOwnerId ? usersById[forcedOwnerId] : null;
        name = configuredTeamName || pickName({}, maybeUser, slug.replace(/-/g, " "));
      }

      if (debug) {
        console.log("[TeamLabel]", {
          slug,
          forcedOwnerId,
          matchedBy,
          gotRosters,
          rosterFound: !!re,
          teamKeys: teamObj ? Object.keys(teamObj) : [],
          chosenLogo: logoUrl,
          chosenName: name
        });
      }
    } catch (err) {
      if (debug) console.warn("TeamLabel: failed to enrich from Sleeper", { slug, err });
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
.avatar { width: var(--sz, 26px); height: var(--sz, 26px); border-radius: 50%; object-fit: cover; }
.name { line-height: 1; }
</style>