<script>
	import { Awards } from '$lib/components'
	import { waitForAll } from '$lib/utils/helper';
	import LinearProgress from '@smui/linear-progress';

    export let data;
    const {awardsData, teamManagersData} = data;
</script>

<style>
    .awards {
        display: block;
        margin: 30px auto;
		width: 95%;
		max-width: 1000px;
		position: relative;
		z-index: 1;
    }

	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

	.roomHeader {
		margin: 0 auto 22px;
		padding: 20px 20px 16px;
		box-sizing: border-box;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		background:
			linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
			linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
			var(--mf-bg);
		border: 1px solid var(--mf-line);
		clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
	}

	.roomTitle {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.02em;
		color: var(--mf-text);
		text-shadow: 0 0 18px var(--mf-line-strong);
	}

	.roomSub {
		font-size: 0.85rem;
		color: var(--mf-dim);
	}

	.roomSub strong {
		color: var(--mf-ion);
	}

	.nothingYet {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
		text-align: center;
	}
</style>

<div class="awards">
	{#await waitForAll(awardsData, teamManagersData) }
		<div class="loading">
			<p>Retrieving awards data...</p>
			<LinearProgress indeterminate />
		</div>
	{:then [podiums, leagueTeamManagers] }
		<div class="roomHeader">
			<h2 class="roomTitle">Trophy Room</h2>
			<span class="roomSub"><strong>{podiums.length}</strong> {podiums.length === 1 ? 'season' : 'seasons'} of hardware</span>
		</div>
		{#each podiums as podium}
			<Awards {podium} {leagueTeamManagers} />
		{:else}
			<p class="nothingYet">No seasons have been completed yet, so no awards have been earned...</p>
		{/each}
	{:catch error}
		<!-- promise was rejected -->
		<p>Something went wrong: {error.message}</p>
	{/await}
</div>