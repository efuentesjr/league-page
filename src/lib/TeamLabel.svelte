<script>
  import { onMount } from "svelte";
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  export let slug = "";      // site team slug (e.g., "do-it-to-them")
  export let href = "";      // optional team link
  export let size = 26;      // avatar size in px
  export let debug = false;  // toggle console diagnostics

  // ---------- helpers ----------
  const asId = (v) => (v == null ? null : String(v));
  const sleeperAvatar = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  function prettifySlug(s = "") {
    const text = s.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  }

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

  function pickTeamLogo(team = {}) {
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

  // Managers config for this slug (if you added it)
  const mgr = Array.isArray(managers) ? managers.find((m) => m?.slug === slug) : null;
  const forcedOwnerId = asId(mgr?.managerID);
  const configuredTeamName = mgr?.teamName ?? null;

  // Initial label: prefer configured teamName, else prettified slug
  let name = configuredTeamName || prettifySlug(slug);
  let logoUrl = "";
  let matchedBy = "none";

  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers();
      const usersById = ltm?.users || {};
      const currentSeason = ltm?.currentSeason;
      const teamManagersMap = ltm?.teamManagersMap?.[currentSeason] || {};

      let re = null;
      let teamObj = null;

      // A) Exact owner match via managers[].managerID
      if (forcedOwnerId) {
        re = findRosterEntryByOwner(teamManagersMap, forcedOwnerId);
        if (re) { matchedBy = "ownerId"; teamObj = re.team || {}; }
      }

      // B) Slug match against roster team names (or related)
      if (!re) {
        re = findRosterEntryBySlug(teamManagersMap, usersById, slug);
        if (re) { matchedBy = "slugified-name"; teamObj = re.team || {}; }
      }

      // Prefer roster team name/logo
      if (teamObj) {
        const candidateLogo = pickTeamLogo(teamObj) || huntLogoUrl(teamObj);
        if (candidateLogo) logoUrl = candidateLogo;

        const tName = teamObj.displayName || teamObj.teamName;
        if (tName) name = tName;
      }

      // Avatar fallback: owner avatar via managerID
      if (!logoUrl && forcedOwnerId && usersById[forcedOwnerId]) {
        logoUrl = sleeperAvatar(usersById[forcedOwnerId].avatar);
        matchedBy = matchedBy === "none" ? "forced-managerID" : matchedBy + "+forced-managerID";
      }

      // Final name fallback (already set to configuredTeamName -> prettified slug)
      if (!name) name = configuredTeamName || prettifySlug(slug);

      if (debug) {
        console.log("[TeamLabel]", {
          slug, forcedOwnerId, matchedBy,
          rosterFound: !!re,
          chosenName: name,
          chosenLogo: logoUrl
        });
      }
    } catch (err) {
      if (debug) console.warn("TeamLabel: enrichment failed", { slug, err });
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
  .teamlabel {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #4da6ff;
    font-weight: 600;
  }
  .teamlabel:hover { text-decoration: underline; }
  .avatar {
    width: var(--sz, 26px);
    height: var(--sz, 26px);
    border-radius: 50%;
    object-fit: cover;
  }
  .name { line-height: 1; }
</style>