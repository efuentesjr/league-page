<script>
	import { onMount } from 'svelte';
	import {
		getLeagueMatchups,
		getLeagueTeamManagers,
		getTeamFromTeamManagers
	} from '$lib/utils/helper';

	const title = 'MFFL LIVE SCOREBOARD';
	const season = '2026 SEASON';
	const weekNumber = 1;

	let games = [];
	let loading = true;
	let error = '';

	const buildGames = (matchupsData, teamManagersData) => {
		const weekData = matchupsData?.matchupWeeks?.find(
			(item) => Number(item.week) === weekNumber
		);

		if (!weekData) {
			throw new Error(`Week ${weekNumber} matchup data was not found.`);
		}

		const matchupList = Object.entries(weekData.matchups || {});

		return matchupList.map(([matchupId, teams], index) => {
			const away = teams[0];
			const home = teams[1];

			const awayTeam = getTeamFromTeamManagers(
				teamManagersData,
				away.roster_id,
				matchupsData.year
			);

			const homeTeam = getTeamFromTeamManagers(
				teamManagersData,
				home.roster_id,
				matchupsData.year
			);

			return {
				matchupId,
				gameNumber: index + 1,

				away: {
					name: awayTeam?.name || 'Unknown Team',
					logo: awayTeam?.avatar || '',
					score: Array.isArray(away.points)
						? away.points.reduce((total, points) => total + Number(points || 0), 0)
						: Number(away.points || 0)
				},

				home: {
					name: homeTeam?.name || 'Unknown Team',
					logo: homeTeam?.avatar || '',
					score: Array.isArray(home.points)
						? home.points.reduce((total, points) => total + Number(points || 0), 0)
						: Number(home.points || 0)
				},

				status: 'LIVE'
			};
		});
	};

	onMount(async () => {
		try {
			loading = true;
			error = '';

			const [matchupsData, teamManagersData] = await Promise.all([
				getLeagueMatchups(),
				getLeagueTeamManagers()
			]);

			games = buildGames(matchupsData, teamManagersData);
		} catch (err) {
			console.error('[scoreboard] Failed to load:', err);
			error = 'Unable to load MFFL matchup data.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="scoreboard">

	<header class="top-bar">

		<div class="league-name">
			MFFL
		</div>

		<div class="header-center">
			<h1>{title}</h1>

			<div class="season">
				{season} <span>•</span> WEEK {weekNumber}
			</div>
		</div>

		<div class="live-indicator">
			<span class="dot"></span>
			LIVE
		</div>

	</header>

	{#if loading}

		<div class="message">
			LOADING MFFL MATCHUPS...
		</div>

	{:else if error}

		<div class="message error">
			{error}
		</div>

	{:else}

		<div class="games">

			{#each games as game}

				<section class="game-card">

					<div class="game-header">
						<span>GAME {game.gameNumber}</span>

						<span class="status">
							{game.status}
						</span>
					</div>

					<div class="team-row">

						<div class="team">

							{#if game.away.logo}
								<img
									src={game.away.logo}
									alt={game.away.name}
									class="logo"
								/>
							{:else}
								<div class="logo">?</div>
							{/if}

							<div class="team-name">
								{game.away.name}
							</div>

						</div>

						<div class="score">
							{game.away.score.toFixed(2)}
						</div>

					</div>

					<div class="team-row">

						<div class="team">

							{#if game.home.logo}
								<img
									src={game.home.logo}
									alt={game.home.name}
									class="logo"
								/>
							{:else}
								<div class="logo">?</div>
							{/if}

							<div class="team-name">
								{game.home.name}
							</div>

						</div>

						<div class="score">
							{game.home.score.toFixed(2)}
						</div>

					</div>

				</section>

			{/each}

		</div>

	{/if}

	<footer class="bottom-bar">

		<div>MFFL • 2026 SEASON</div>

		<div>WEEK {weekNumber}</div>

		<div>LIVE MFFL SCORES</div>

	</footer>

</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: #000;
	}

	:global(body) {
		overflow: hidden;
	}

	.scoreboard {
		position: fixed;
		inset: 0;
		z-index: 9999;

		display: flex;
		flex-direction: column;

		background:
			radial-gradient(
				circle at top center,
				#18202a 0%,
				#080b0f 42%,
				#000 100%
			);

		color: #fff;

		font-family:
			Arial,
			Helvetica,
			sans-serif;

		overflow: hidden;
	}

	.top-bar {
		height: 90px;
		min-height: 90px;

		display: grid;
		grid-template-columns: 180px 1fr 180px;
		align-items: center;

		padding: 0 35px;

		background: rgba(0, 0, 0, 0.9);

		border-bottom: 2px solid #333;
	}

	.league-name {
		font-size: 34px;
		font-weight: 900;
		letter-spacing: 5px;
	}

	.header-center {
		text-align: center;
	}

	h1 {
		margin: 0;

		font-size: 32px;
		font-weight: 900;
		letter-spacing: 5px;
	}

	.season {
		margin-top: 6px;

		font-size: 15px;
		font-weight: 700;
		letter-spacing: 4px;

		color: #aaa;
	}

	.season span {
		padding: 0 8px;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;

		font-size: 18px;
		font-weight: 900;
		letter-spacing: 2px;
	}

	.dot {
		width: 12px;
		height: 12px;

		border-radius: 50%;

		background: #e21b23;

		box-shadow:
			0 0 12px rgba(226, 27, 35, 0.8);
	}

	.games {
		flex: 1;
		min-height: 0;

		display: grid;

		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-template-rows: repeat(2, minmax(0, 1fr));

		gap: 14px;

		padding: 16px 22px;
	}

	.game-card {
		display: flex;
		flex-direction: column;

		min-width: 0;
		min-height: 0;

		background:
			linear-gradient(
				180deg,
				#171b20 0%,
				#0d1014 100%
			);

		border: 1px solid #353b42;

		border-radius: 8px;

		overflow: hidden;

		box-shadow:
			0 4px 15px rgba(0, 0, 0, 0.5);
	}

	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: center;

		padding: 9px 14px;

		background: #20252b;

		border-bottom: 1px solid #383e45;

		font-size: 12px;
		font-weight: 800;
		letter-spacing: 2px;

		color: #999;
	}

	.status {
		color: #bbb;
	}

	.team-row {
		flex: 1;
		min-height: 0;

		display: flex;
		align-items: center;
		justify-content: space-between;

		padding: 12px 18px;

		border-bottom: 1px solid #292e34;
	}

	.team-row:last-child {
		border-bottom: none;
	}

	.team {
		display: flex;
		align-items: center;
		gap: 14px;

		min-width: 0;
	}

	.logo {
		width: 42px;
		height: 42px;

		display: flex;
		align-items: center;
		justify-content: center;

		flex-shrink: 0;

		border: 1px solid #555;
		border-radius: 50%;

		background: #111;

		font-size: 18px;
		font-weight: 900;
		color: #777;

		object-fit: cover;
	}

	.team-name {
		overflow: hidden;

		font-size: 17px;
		font-weight: 800;

		letter-spacing: 0.5px;

		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.score {
		margin-left: 10px;

		font-size: 30px;
		font-weight: 900;

		font-variant-numeric: tabular-nums;

		white-space: nowrap;
	}

	.message {
		flex: 1;

		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 24px;
		font-weight: 800;
		letter-spacing: 3px;

		color: #aaa;
	}

	.message.error {
		color: #e21b23;
	}

	.bottom-bar {
		height: 35px;
		min-height: 35px;

		display: flex;
		align-items: center;
		justify-content: space-between;

		padding: 0 25px;

		background: #050505;

		border-top: 1px solid #292929;

		font-size: 10px;
		font-weight: 700;
		letter-spacing: 2px;

		color: #777;
	}
</style>
