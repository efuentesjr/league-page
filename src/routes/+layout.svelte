<!-- __layout.svelte -->
<script>
  import { Nav, Footer } from "$lib/components";
  import { dev } from '$app/environment';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import { onMount } from 'svelte';

  export let data; // if a loader returns leagueTeamManagersData, we'll see it

  injectAnalytics({ mode: dev ? 'development' : 'production' });

  onMount(() => {
    const list = data?.leagueTeamManagersData ?? null;
    if (!list) {
      console.warn('[diag] No leagueTeamManagersData at layout. If you only load it on pages, we’ll run this there next.');
      return;
    }

    const rows = list.map(t => {
      const teamId = Number(t.teamId ?? t.team_id ?? t.roster_id ?? t.rosterId ?? NaN);
      const teamName = (t.teamName ?? t.team_name ?? '').trim();
      const managerName = (t.managerName ?? t.manager_name ?? t.name ?? '').trim();
      return {
        teamId,
        teamName,
        managerName,
        teamNameMissing: !teamName,
        looksLikeManagerShown: !teamName || teamName === managerName
      };
    });

    console.group('[diag] leagueTeamManagersData summary');
    console.table(rows);
    console.groupEnd();
  });
</script>

<main>
  <Nav />
  <slot />
  <Footer />
</main>
