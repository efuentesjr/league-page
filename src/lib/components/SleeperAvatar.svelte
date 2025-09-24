<script>
  import { onMount } from 'svelte';
  import { managers } from '$lib/utils/leagueInfo';
  import { getLeagueTeamManagers } from '$lib/utils/helperFunctions/leagueTeamManagers';

  /**
   * Props:
   *  - slug : team slug from your site (required)
   *  - size : px (default 24)
   *  - alt  : alt text (optional)
   */
  export let slug;
  export let size = 24;
  export let alt = '';

  // ---------------- helpers ----------------
  const s = (v) => (typeof v === 'string' ? v.trim() : '');
  const mkSlug = (str = '') =>
    str
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');

  // local filenames should live at /static/logos/<file>
  const LOGO_BASE = '/logos';
  const normalizeLocal = (u) => `${LOGO_BASE}/${String(u).replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/');

  const slugToOwner = new Map(
    (Array.isArray(managers) ? managers : []).map((m) => [m.slug, String(m.managerID ?? '')])
  );

  // component state
  let src = '';

  // Try to resolve an avatar URL from Sleeper for this slug
  onMount(async () => {
    try {
      const ltm = await getLeagueTeamManagers();
      const season = ltm?.currentSeason;
      const bucket = ltm?.teamManagersMap?.[season] || {};
      const users = ltm?.users || {};

      // 1) Owner by config mapping
      const ownerFromConfig = slugToOwner.get(slug);
      if (ownerFromConfig) {
        const u = users[ownerFromConfig];
        const avatar = s(u?.avatar);
        if (avatar) {
          src = `https://sleepercdn.com/avatars/thumbs/${avatar}`;
          return;
        }
      }

      // 2) Find roster by team name matching the slug (displayName, teamName, metadata.team_name)
      let ownerFromName = '';
      for (const rid of Object.keys(bucket)) {
        const entry = bucket[rid];
        const t = entry?.team || {};
        const candidates = [
          s(t.displayName),
          s(t.teamName),
          s(t?.metadata?.team_name)
        ].filter(Boolean);

        const hit = candidates.some((c) => mkSlug(c) === mkSlug(slug));
        if (hit) {
          ownerFromName =
            s(t.owner_id) ||
            s(entry?.managers?.[0]?.user_id || entry?.managers?.[0]?.managerID);
          if (ownerFromName) break;
        }
      }

      if (ownerFromName) {
        const u = users[ownerFromName];
        const avatar = s(u?.avatar);
        if (avatar) {
          src = `https://sleepercdn.com/avatars/thumbs/${avatar}`;
          return;
        }
      }

      // 3) Fallback to your config logo (absolute URL, data:, /path, or bare filename)
      const cfg = (Array.isArray(managers) ? managers : []).find((m) => m.slug === slug) || {};
      const rawLogo = s(cfg.logoUrl ?? cfg.teamLogo ?? cfg.avatarUrl ?? '');
      if (rawLogo) {
        if (/^https?:\/\//i.test(rawLogo) || rawLogo.startsWith('data:') || rawLogo.startsWith('/')) {
          src = rawLogo;
        } else {
          // treat bare filenames like "12738.jpg" as /static/logos/12738.jpg
          src = normalizeLocal(rawLogo);
        }
        return;
      }

      // 4) Nothing else found -> leave src empty (no image)
      src = '';
    } catch {
      // leave src empty on any error
      src = '';
    }
  });

  const hideOnError = (e) => {
    // hide broken image so the row stays tidy
    e.currentTarget.style.display = 'none';
  };
</script>

{#if src}
  <img
    class="sleeper-avatar"
    src={src}
    alt={alt || slug}
    width={size}
    height={size}
    loading="lazy"
    referrerpolicy="no-referrer"
    crossorigin="anonymous"
    on:error={hideOnError}
  />
{/if}

<style>
  .sleeper-avatar {
    display: inline-block;
    vertical-align: middle;
    border-radius: 50%;
    object-fit: cover;
  }
</style>
