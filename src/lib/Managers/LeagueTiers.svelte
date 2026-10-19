<!--
	League Tiers
	Splits every team into Contender / Bubble / Rebuilding, using
	computeTeamTiers (record, points, rest-of-season projections
	and roster age). Shown on the All Managers page.
-->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		getLeagueRosters,
		getLeagueData,
		getNflState,
		loadPlayers,
		waitForAll
	} from '$lib/utils/helper';
	import { computeTeamTiers, TIER_ORDER } from '$lib/utils/helperFunctions/managerInsights';

	export let managers, leagueTeamManagers;

	const TIER_BLURBS = {
		Contender: 'Built to win this year',
		Bubble: 'Could go either way',
		Rebuilding: 'Building for next year'
	};

	let sections = [];
	let state = 'loading';

	const buildSections = (tiers) => {
		const year = leagueTeamManagers.currentSeason;
		const yearTeams = leagueTeamManagers.teamManagersMap[year] || {};

		const grouped = Object.fromEntries(TIER_ORDER.map((t) => [t, []]));

		for (const [rosterID, info] of Object.entries(tiers)) {
			const entry = yearTeams[rosterID];
			const managerIDs = entry?.managers || [];
			const configIndex = managers.findIndex((m) =>
				managerIDs.includes(String(m.managerID))
			);

			grouped[info.tier]?.push({
				...info,
				rosterID,
				name: entry?.team?.name || 'Unknown Team',
				avatar: entry?.team?.avatar,
				configIndex
			});
		}

		return TIER_ORDER.map((tier) => ({
			tier,
			blurb: TIER_BLURBS[tier],
			teams: grouped[tier].sort((a, b) => a.rank - b.rank)
		}));
	};

	onMount(async () => {
		try {
			const [rostersData, leagueData, nflState, playerData] = await waitForAll(
				getLeagueRosters(),
				getLeagueData(),
				getNflState(),
				loadPlayers(null)
			);

			const tiers = computeTeamTiers({
				rosters: rostersData.rosters,
				players: playerData.players,
				leagueData,
				nflState
			});

			sections = buildSections(tiers);
			state = Object.keys(tiers).length ? 'ready' : 'empty';
		} catch (err) {
			console.error('[LeagueTiers] Could not build tiers:', err);
			state = 'error';
		}
	});

	const openManager = (team) => {
		if (team.configIndex > -1) goto(`/manager?manager=${team.configIndex}`);
	};
</script>

{#if state === 'ready'}
	<section class="tiers">
		<h3>League Tiers</h3>
		<p class="subhead">Updated live from records, points scored, rest-of-season projections and roster age.</p>

		<div class="tierGrid">
			{#each sections as section}
				<div class="tierColumn tier-{section.tier.toLowerCase()}">
					<div class="tierHeader">
						<span class="tierName">{section.tier}</span>
						<span class="tierBlurb">{section.blurb}</span>
					</div>

					{#each section.teams as team}
						<button
							class="tierTeam"
							class:clickable={team.configIndex > -1}
							type="button"
							onclick={() => openManager(team)}
						>
							<span class="tierRank">#{team.rank}</span>
							<img class="tierAvatar" src={team.avatar} alt="" />
							<span class="tierTeamName">{team.name}</span>
							<img
								class="tierMode"
								src="/{team.mode.replace(' ', '%20')}.png"
								alt={team.mode}
								title={team.mode}
							/>
						</button>
					{/each}
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.tiers {
		margin: 0 auto 3em;
	}

	h3 {
		text-align: center;
		font-size: 1.6em;
		font-weight: 300;
		margin: 0 0 0.2em;
	}

	.subhead {
		text-align: center;
		font-size: 0.8em;
		color: #888;
		margin: 0 1em 1.5em;
	}

	.tierGrid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
	}

	.tierColumn {
		border-radius: 10px;
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-top: 3px solid var(--tierColor);
	}

	.tier-contender {
		--tierColor: #e5b52a;
	}

	.tier-bubble {
		--tierColor: #4a90d9;
	}

	.tier-rebuilding {
		--tierColor: #e2722b;
	}

	.tierHeader {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 8px;
	}

	.tierName {
		font-size: 1.05em;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--tierColor);
	}

	.tierBlurb {
		font-size: 0.72em;
		color: #888;
	}

	.tierTeam {
		display: grid;
		grid-template-columns: 2.2em 28px minmax(0, 1fr) 26px;
		align-items: center;
		gap: 8px;

		width: 100%;
		padding: 6px 4px;
		margin: 0;

		background: none;
		border: none;
		border-radius: 6px;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: default;
	}

	.tierTeam.clickable {
		cursor: pointer;
	}

	.tierTeam.clickable:hover {
		background: rgba(255, 255, 255, 0.06);
	}

	.tierRank {
		font-size: 0.8em;
		font-weight: 700;
		color: #888;
		text-align: right;
	}

	.tierAvatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		object-fit: cover;
	}

	.tierTeamName {
		font-size: 0.88em;
		font-weight: 600;
		line-height: 1.15;
		overflow-wrap: anywhere;
	}

	.tierMode {
		height: 26px;
		width: 26px;
		object-fit: contain;
	}

	@media (max-width: 700px) {
		.tierGrid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
