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

  const prettifySlug = (s = "") =>
    s.replace(/-/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, c => c.toUpperCase());

  const mkSlug = (str) =>
    (str || "")
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");

  const pickTeamLogo = (team = {}) =>
    team.logoUrl || team.avatarUrl || team.teamAvatar || team.logo || team.avatar || "";

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

  // Find roster by owner (managerID)
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

  // Prefer matching slugs to *team* names first; only then consider manager names
  function findRosterEntryBySlug(map = {}, usersById = {}, wantedSlug) {
    if (!wantedSlug) return null;

    const byTeamName = [];
    const byManagerName = [];

    for (const rid of Object.keys(map)) {
      const entry = map[rid];
      if (!entry) continue;
      const t = entry.team || {};

      const teamCandidates = [t.displayName, t.teamName, t.name, t?.metadata?.team_name].filter(Boolean);
      const teamSlugs = teamCandidates.map(mkSlug);
      if (teamSlugs.includes(wantedSlug)) byTeamName.push(entry);

      // Manager candidates (secondary)
      for (const m of entry.managers || []) {
        const uid = asId(m?.user_id || m?.managerID);
        const u = uid && usersById[uid] ? usersById[uid] : null;
        const managerCandidates = [
          u?.display_name,
          u?.user_name,
          m?.display_name,
          m?.user_name,
          m?.name
        ].filter(Boolean);
        const managerSlugs = managerCandidates.map(mkSlug);
        if (managerSlugs.includes(wantedSlug)) byManagerName.push(entry);
      }
    }

    return byTeamName[0] || byManagerName[0] || null;
  }

  // Scan an object for plausible team-name fields (avoids manager names)
  function huntTeamName(obj, managerBlacklist = new Set()) {
    const keysRegex = /(team.?name|display.?name|nickname|franchise|club)/i;
    try {
      const seen = new Set();
      const stack = [obj];
      while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
        seen.add(cur);
        for (const k of Object.keys(cur)) {
          const v = cur[k];
          if (typeof v === "string" && keysRegex.test(k)) {
            const val = v.trim();
            if (val.length >= 2 && !managerBlacklist.has(val)) return val;
          } else if (typeof v === "object") {
            stack.push(v);
          }
        }
      }
    } catch {}
    return "";
  }

  // Managers config for this slug (if present)
  const mgr = Array.isArray(managers) ? managers.find((m) => m?.slug === slug) : null;
  const forcedOwnerId = asId(mgr?.managerID);
  const configuredTeamName = mgr?.teamName ?? null;

  // Initial label: prefer configured teamName, else prettified slug (may equal a manager name)
  let name = configuredTeamName || prettifySlug(slug);
  let logoUrl = "";
  let matchedBy = "none";

  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers(); // your unified source
      const usersById = ltm?.users || {};
      const currentSeason = ltm?.currentSeason;
      const teamManagersMap = ltm?.teamManagersMap?.[currentSeason] || {};

      let entry = null;
      let teamObj = null;

      // A) Exact owner match via managers[].managerID
      if (forcedOwnerId) {
        entry = findRosterEntryByOwner(teamManagersMap, forcedOwnerId);
        if (entry) { matchedBy = "ownerId"; teamObj = entry.team || {}; }
      }

      // B) Slug match (prefer team names; manager names only if needed)
      if (!entry) {
        entry = findRosterEntryBySlug(teamManagersMap, usersById, mkSlug(slug));
        if (entry) { matchedBy = matchedBy === "none" ? "slug" : matchedBy + "+slug"; teamObj = entry.team || {}; }
      }

      // Build a blacklist of manager names to avoid showing as the team
      const managerBlacklist = new Set();
      if (entry?.managers?.length) {
        for (const m of entry.managers) {
          const uid = asId(m?.user_id || m?.managerID);
          const u = uid && usersById[uid] ? usersById[uid] : {};
          [u.display_name, u.user_name, m?.display_name, m?.user_name, m?.name]
            .filter(Boolean)
            .forEach(n => managerBlacklist.add(n));
          // Also blacklist prettified slug if it equals a manager label
          managerBlacklist.add(prettifySlug(mkSlug(u?.display_name || u?.user_name || "")));
        }
      }

      // Prefer a real roster team name
      let derivedTeamName =
        teamObj?.displayName ||
        teamObj?.teamName ||
        teamObj?.name ||
        teamObj?.metadata?.team_name ||
        "";

      if (!derivedTeamName && entry) {
        // Last-ditch: scan the whole entry for plausible team names (avoid manager names)
        derivedTeamName = huntTeamName(entry, managerBlacklist);
      }

      if (derivedTeamName) name = derivedTeamName;

      // Logo preference: roster logo, else any URL found, else owner avatar
      const candidateLogo = pickTeamLogo(teamObj) || huntLogoUrl(teamObj) || huntLogoUrl(entry);
      if (candidateLogo) {
        logoUrl = candidateLogo;
      } else if (forcedOwnerId && usersById[forcedOwnerId]) {
        logoUrl = sleeperAvatar(usersById[forcedOwnerId].avatar);
        matchedBy = matchedBy === "none" ? "forced-managerID" : matchedBy + "+forced-managerID";
      }

      // Final fallback if still empty
      if (!name) name = configuredTeamName || prettifySlug(slug);

      if (debug) {
        console.log("[TeamLabel]", {
          slug, forcedOwnerId, matchedBy,
          rosterFound: !!entry,
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
