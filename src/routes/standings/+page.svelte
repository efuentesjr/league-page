<script>
  import { onMount } from 'svelte';
  import { Standings } from '$lib/components';

  export let data;

  // show exactly what the loader returned to this page
  onMount(() => {
    const keys = data ? Object.keys(data) : [];
    console.group('[diag] +page.svelte data keys (Standings)');
    console.log(keys);
    console.log('data:', data);
    console.groupEnd();
  });

  // keep whatever you DO have so the page renders
  const { standingsData } = data ?? {};
  // NOTE: we are NOT destructuring leagueTeamManagersData anymore since it wasn't present
</script>

<div class="holder">
  <!-- Pass what we have; if Standings needs the managers list, it might be fetching it itself -->
  <Standings {standingsData} />
</div>

<style>
  .holder { position: relative; z-index: 1; text-align: center; }
</style>
