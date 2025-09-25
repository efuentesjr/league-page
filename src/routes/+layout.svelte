<!-- __layout.svelte -->
<script>
  import { Nav, Footer } from "$lib/components";
  import { dev } from '$app/environment';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import { onMount } from 'svelte';
  import { getLeagueTeamManagers } from '$lib/utils/helperFunctions/leagueTeamManagers';

  injectAnalytics({ mode: dev ? 'development' : 'production' });

  // Force a fresh LTM pull on first mount (fixes stale in-app state)
  onMount(async () => {
    try {
      await getLeagueTeamManagers(true); // <-- ignore any cached store, fetch fresh
    } catch (e) {
      console.warn('[layout] LTM refresh failed', e);
    }
  });
</script>

<main>
  <Nav />
  <slot />
  <Footer />
</main>

