<script>
  import { onMount } from 'svelte';
  import { managers } from '$lib/utils/leagueInfo';
  import { getLeagueTeamManagers } from '$lib/utils/helperFunctions/leagueTeamManagers';

  /**
   * Props:
   *  - slug: team slug from your site (required)
   *  - size: px (default 24)
   *  - alt : alt text (optional)
   */
  export let slug;
  export let size = 24;
  export let alt = '';

  const s = (v) => (typeof v === 'string' ? v.trim() : '');
  const slugToOwner = new Map(
    (Array.isArray(managers) ? managers : []).map((m) => [m.slug, String(m.managerID ?? '')])
  );

  let src = '';
  let title = '';

  onMount(async () => {
    try {
      const owner = slugToOwner.get(slug);
      if (!owner) return;

      // Uses your cached LTM; includes all league users with avatar hashes
      const ltm = await getLeagueTeamManagers();
      const user = ltm?.users?.[owner] || {};
      const avatar = s(user.avatar);

      title = s(user.display_name || user.user_name || '');

      if (avatar) {
        // Sleeper avatar CDN (thumbs) – stable, proper headers
        src = `https://sleepercdn.com/avatars/thumbs/${avatar}`;
      }
    } catch (_) {
      // swallow – component will just render no image
    }
  });
</script>

{#if src}
  <img
    class="sleeper-avatar"
    src={src}
    alt={alt || title || slug}
    width={size}
    height={size}
    loading="lazy"
    referrerpolicy="no-referrer"
    crossorigin="anonymous"
    on:error={(e) => (e.currentTarget.style.display = 'none')}
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
