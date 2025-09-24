<script>
  import { onMount } from 'svelte';

  // Adjust the prop name if your page uses a different one
  export let leagueTeamManagersData;

  onMount(() => {
    const list = leagueTeamManagersData ?? [];
    if (!list.length) {
      console.warn('[diag] standings page has no leagueTeamManagersData');
      return;
    }
    const rows = list.map(t => ({
      teamId: Number(t.teamId ?? t.team_id ?? t.roster_id ?? t.rosterId ?? NaN),
      teamName: String(t.teamName ?? t.team_name ?? '').trim(),
      managerName: String(t.managerName ?? t.manager_name ?? t.name ?? '').trim(),
      teamNameMissing: !(t.teamName ?? t.team_name ?? '').trim(),
      looksLikeManagerShown:
        !(t.teamName ?? t.team_name ?? '').trim() ||
        String(t.teamName ?? t.team_name ?? '').trim() === String(t.managerName ?? t.manager_name ?? t.name ?? '').trim()
    }));
    console.group('[diag] leagueTeamManagersData summary (Standings)');
    console.table(rows);
    console.groupEnd();
  });


	import { Standings } from '$lib/components'

	export let data;
	const {standingsData, leagueTeamManagersData} = data;
</script>

<style>
	.holder {
		position: relative;
		z-index: 1;
		text-align: center;
	}
</style>

<div class="holder">
	<Standings {standingsData} {leagueTeamManagersData} />
</div>
