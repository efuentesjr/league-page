<script>
	import { Standings } from '$lib/components';
	import PlayoffBracket from '$lib/Standings/PlayoffBracket.svelte';
	import { onMount } from 'svelte';

	export let data;
	const { standingsData, leagueTeamManagersData } = data;

	// Standings | Playoffs (the playoff view opens straight from /standings#playoffs)
	let view = 'standings';
	onMount(() => {
		if (location.hash === '#playoffs') view = 'playoffs';
	});
	const show = (v) => {
		view = v;
		history.replaceState(history.state, '', v === 'playoffs' ? '#playoffs' : location.pathname);
	};
</script>

<style>
	.holder {
		position: relative;
		z-index: 1;
		text-align: center;
	}

	.tabs {
		display: flex;
		justify-content: center;
		padding-top: 22px;
	}

	.tabs button {
		padding: 8px 16px;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mf-ion);
		background: var(--mf-bg);
		border: 1px solid var(--mf-line-strong);
		cursor: pointer;
	}

	.tabs button.active {
		color: var(--mf-on-ion);
		background: var(--mf-ion);
		border-color: var(--mf-ion);
	}
</style>

<div class="holder">
	<div class="tabs" role="tablist" aria-label="Standings view">
		<button type="button" class:active={view === 'standings'} onclick={() => show('standings')}>Standings</button>
		<button type="button" class:active={view === 'playoffs'} onclick={() => show('playoffs')}>Playoffs</button>
	</div>
	{#if view === 'standings'}
		<Standings {standingsData} {leagueTeamManagersData} />
	{:else}
		<PlayoffBracket />
	{/if}
</div>
