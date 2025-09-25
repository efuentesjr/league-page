<!-- __layout.svelte -->
<script>
  import { Nav, Footer } from "$lib/components";
  import { dev } from '$app/environment';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import { onMount } from 'svelte';
  import { BUILD_ID } from '$lib/buildInfo';

  injectAnalytics({ mode: dev ? 'development' : 'production' });

  // --- Build guard: kill stale SW/caches inside the installed app or in-app browsers ---
  onMount(async () => {
    try {
      const KEY = 'app.build_id';
      const prev = localStorage.getItem(KEY);

      if (prev !== BUILD_ID) {
        // Unregister all service workers (prevents serving old JS/HTML)
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }

        // Clear Cache Storage buckets that SW/in-app may have left behind
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }

        // Persist the new build id and reload once to fetch fresh assets
        localStorage.setItem(KEY, BUILD_ID);
        // Avoid infinite loop: only reload if we actually changed the value
        location.reload();
      }
    } catch (e) {
      console.warn('[build-guard] failed to refresh app cache', e);
    }
  });
</script>

<main>
  <Nav /> <!-- adds the nav (small and large) -->
  <slot />
  <Footer /> <!-- adds the footer -->
</main>

