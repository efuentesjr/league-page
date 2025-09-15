<script>
  import { onMount } from "svelte";
  import { getLeagueTeamManagers } from "$lib/utils/helperFunctions/leagueTeamManagers";
  import { managers } from "$lib/utils/leagueInfo";

  export let slug = "";      // e.g. "do-it-to-them"
  export let href = "";      // optional team link
  export let size = 26;      // avatar size in px

  let name = slug;           // will be upgraded
  let logoUrl = "";          // will be resolved
  let matchedBy = "none";    // for internal tracing if you need it

  // ---------------- helpers ----------------
  const asId = (v) => (v == null ? null : String(v));
  const sleeperAvatar = (avatarId) =>
    avatarId ? `https://sleepercdn.com/avatars/thumbs/${avatarId}` : "";

  // normalize text into your site’s slug style
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

  // pull a logo from common fields on roster “team” objects
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

  // hunt for any image-looking URL in a nested object
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
            if (/^https?:\/\//i.test(v) && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(v)) return v;
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

  // ---- final, guaranteed fallback: a monogram SVG data URL ----
  function monogramDataUrl(label = "?", seed = "") {
    const initials = (label || "?")
      .trim()
      .split(/\s+/)
      .map(s => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

    // simple hash → stable color out of palette
    const palette = ["#4F46E5","#16A34A","#DC2626","#0891B2","#D97706","#9333EA","#0EA5E9","#059669"];
    let h = 0;
    const key = (seed || label || "?") + ":" + initials;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    const bg = palette[h % palette.length];

    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
        <defs>
          <filter id='s' x='-10%' y='-10%' width='120%' height='120%'>
            <feDropShadow dx='0' dy='1.5' stdDeviation='1.5' flood-color='rgba(0,0,0,.35)'/>
          </filter>
        </defs>
        <rect width='64' height='64' rx='12' fill='${bg}'/>
        <text x='50%' y='52%' text-anchor='middle' font-family='system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial' font-size='28' fill='white' filter='url(#s)'>${initials}</text>
      </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // -------------- resolve identity --------------
  const mgr = Array.isArray(managers) ? managers.find((m) => m?.slug === slug) : null;
  if (mgr?.name) name = mgr.name;
  const ownerId = asId(mgr?.managerID);

  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers();
      const usersById = ltm?.users || {};
      const currentSeason = ltm?.currentSeason;
      const teamManagersMap = ltm?.teamManagersMap?.[currentSeason] || {};

      let re = null;
      let teamObj = null;

      // A) by configured ownerId (if present)
      if (ownerId) {
        re = findRosterEntryByOwner(teamManagersMap, ownerId);
        if (re) { matchedBy = "ownerId"; teamObj = re.team || {}; }
      }

      // B) by slugified roster/team/user names
      if (!re) {
        re = findRosterEntryBySlug(teamManagersMap, usersById, slug);
        if (re) { matchedBy = "slugified-name"; teamObj = re.team || {}; }
      }

      // take team logo/name if available
      if (teamObj) {
        logoUrl = pickLogo(teamObj) || huntLogoUrl(teamObj) || logoUrl;
        name = pickName(teamObj, {}, name);
      }

      // choose a user to fall back to: first roster manager, else configured owner
      let user = null;
      const firstMgrId = re?.managers?.[0] ? asId(re.managers[0].user_id || re.managers[0].managerID) : null;
      if (firstMgrId && usersById[firstMgrId]) user = usersById[firstMgrId];
      else if (ownerId && usersById[ownerId]) user = usersById[ownerId];

      // C) if still missing, match slug to ANY user display/user_name (stable)
      if (!user) {
        for (const uid of Object.keys(usersById)) {
          const u = usersById[uid];
          const slugs = [u.display_name, u.user_name].filter(Boolean).map(mkSlug);
          if (slugs.includes(slug)) { user = u; matchedBy = matchedBy === "none" ? "user-slug" : matchedBy + "+user-slug"; break; }
        }
      }

      // user avatar + name fallback
      if (user) {
        logoUrl ||= sleeperAvatar(user.avatar);
        name ||= pickName({}, user, name);
      }

      // D) GUARANTEED: if we still don’t have a logo, synthesize a monogram
      if (!logoUrl) {
        logoUrl = monogramDataUrl(name || slug, slug);
        if (matchedBy === "none") matchedBy = "monogram";
      }
    } catch {
      // Even on error, guarantee something shows
      logoUrl ||= monogramDataUrl(name || slug, slug);
      if (matchedBy === "none") matchedBy = "monogram";
    }
  });
</script>

{#if href}
  <a class="teamlabel" href={href} title={matchedBy}>
    <img class="avatar" src={logoUrl} alt={name} loading="lazy" style={`--sz:${size}px`} />
    <span class="name">{name}</span>
  </a>
{:else}
  <span class="teamlabel" title={matchedBy}>
    <img class="avatar" src={logoUrl} alt={name} loading="lazy" style={`--sz:${size}px`} />
    <span class="name">{name}</span>
  </span>
{/if}

<style>
.teamlabel { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #4da6ff; font-weight: 600; }
.teamlabel:hover { text-decoration: underline; }
.avatar { width: var(--sz, 26px); height: var(--sz, 26px); border-radius: 50%; object-fit: cover; background: #222; }
.name { line-height: 1; }
</style>
