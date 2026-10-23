<!--
	The playoff bracket on the Standings page (same bracket as Matchups → Playoffs).
-->
<script>
	import { onMount } from 'svelte';
	import LinearProgress from '@smui/linear-progress';
	import Brackets from '$lib/Matchups/Brackets.svelte';
	import { getBrackets, getLeagueTeamManagers, loadPlayers } from '$lib/utils/helper';

	let brackets, leagueTeamManagers, players;
	let state = 'loading';
	let selection = 'champions';

	onMount(async () => {
		try {
			const [b, ltm, p] = await Promise.all([getBrackets(), getLeagueTeamManagers(), loadPlayers(null)]);
			brackets = b;
			leagueTeamManagers = ltm;
			players = p.players;
			state = brackets?.champs?.bracket?.[0]?.[0]?.[0]?.points ? 'ready' : 'empty';
		} catch (err) {
			console.error('[Standings] Could not load the bracket', err);
			state = 'error';
		}
	});
</script>

{#if state === 'loading'}
	<div class="msg"><p>Loading the bracket…</p><LinearProgress indeterminate /></div>
{:else if state === 'error'}
	<p class="msg">Could not load the bracket. Refresh to try again.</p>
{:else if state === 'empty'}
	<p class="msg">The playoff bracket fills in once Sleeper sets the matchups.</p>
{:else}
	<div class="sub" role="tablist" aria-label="Bracket">
		<button type="button" class:active={selection === 'champions'} onclick={() => (selection = 'champions')}>Champions' Bracket</button>
		<button type="button" class:active={selection === 'losers'} onclick={() => (selection = 'losers')}>Losers' Bracket</button>
	</div>
	<Brackets queryWeek={null} syncUrl={false} {leagueTeamManagers} {players} {brackets} bind:selection />
{/if}

<style>
	.msg {
		width: 85%;
		max-width: 500px;
		margin: 60px auto;
		color: var(--mf-dim);
	}

	.sub {
		display: flex;
		justify-content: center;
		margin-top: 4px;
	}

	.sub button {
		padding: 8px 14px;
		font: inherit;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-ion);
		background: var(--mf-bg);
		border: 1px solid var(--mf-line-strong);
		cursor: pointer;
	}

	.sub button.active {
		color: var(--mf-on-ion);
		background: var(--mf-ion);
		border-color: var(--mf-ion);
	}
</style>
