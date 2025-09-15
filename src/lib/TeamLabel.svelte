<script>
  import { onMount } from "svelte";
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  export let slug = "";      // site team slug (e.g., "do-it-to-them")
  export let href = "";      // optional team link
  export let size = 26;      // avatar size in px
  export let debug = false;  // turn on to log diagnostics

  let name = slug;           // fallback until Sleeper data loads
  let logoUrl = "";          // will be filled from roster/team or user
  let matchedBy = "none";    // for debug: ownerId | slugified-name | user-slug | none

  // ---------- helpers ----------
  const asId = (v) => (v == null ? null : String(v));
  const sleeperAvatar = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  // Normalizes strings similar to your site slugs
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

  // If no obvious field exists, scan for any image-like URL in the team object
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
      const teamCandidates = [
        t.displayName,
        t.teamName
      ].filter(Boolean);

      // also try owner/user names
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

  // Managers config record for this slug (may be missing/mismatched)
  const mgr = Array.isArray(managers) ? managers.find((m) => m?.slug === slug) : null;
  if (mgr?.name) name = mgr.name;
  const ownerId = asId(mgr?.managerID);

  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers(); // same feed as Standings
      const usersById = ltm?.users || {};
      const currentSeason = ltm?.currentSeason;
      const teamManagersMap = ltm?.teamManagersMap?.[currentSeason] || {};
      const gotRosters = Object.keys(teamManagersMap).length;

      let re = null;
      let teamObj = null;

      // Path A: exact owner match from managers[] (if provided)
      if (ownerId) {
        re = findRosterEntryByOwner(teamManagersMap, ownerId);
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

      // Use team name/logo from roster
      if (teamObj) {
        let candidateLogo = pickLogo(teamObj) || huntLogoUrl(teamObj);
        if (candidateLogo) logoUrl = candidateLogo;

        const candidateName = pickName(teamObj, {}, name);
        if (candidateName) name = candidateName;
      }

      // Path C: as a last resort, match slug to ANY user display_name/user_name
      if (!logoUrl) {
        let matchedUser = null;
        for (const uid of Object.keys(usersById)) {
          const u = usersById[uid];
          const uSlugs = [u.display_name, u.user_name].filter(Boolean).map(mkSlug);
          if (uSlugs.includes(slug)) { matchedUser = u; break; }
        }
        if (matchedUser) {
          matchedBy = matchedBy === "none" ? "user-slug" : matchedBy + "+user-slug";
          logoUrl = sleeperAvatar(matchedUser.avatar) || logoUrl;
          if (!name) name = pickName({}, matchedUser, slug);
        }
      }

      // Fallback to the first manager on the roster (if any) for a name/avatar
      if (!logoUrl && re?.managers?.length) {
        const firstMgrId = asId(re.managers[0].user_id || re.managers[0].managerID);
        const u = firstMgrId ? usersById[firstMgrId] : null;
        if (u) {
          if (!logoUrl) logoUrl = sleeperAvatar(u.avatar);
          if (!name) name = pickName({}, u, slug);
        }
      }

      if (debug) {
        console.log("[TeamLabel]", {
          slug,
          ownerId,
          matchedBy,
          gotUsers: Object.keys(usersById).length,
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
.avatar {
  width: var(--sz, 26px);
  height: var(--sz, 26px);
  border-radius: 50%;
  object-fit: cover;
}
.name { line-height: 1; }
</style>
