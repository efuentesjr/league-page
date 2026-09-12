<script>
	import { onMount } from 'svelte';
	import {
		getLeagueMatchups,
		getLeagueTeamManagers,
		getTeamFromTeamManagers,
		getRivalryMatchups
	} from '$lib/utils/helper';

	const title = 'MFFL LIVE SCOREBOARD';
	const season = '2026 SEASON';
	const weekNumber = 1;

	const HOLD_TIME = 5000;
	const SLIDE_TIME = 900;

	let games = [];
	let loading = true;
	let error = '';
	let currentGame = 0;
	let transitioning = false;

	const buildGames = async (matchupsData, teamManagersData) => {
		const weekData = matchupsData?.matchupWeeks?.find(
			(item) => Number(item.week) === weekNumber
		);

		if (!weekData) {
			throw new Error(`Week ${weekNumber} matchup data was not found.`);
		}

		const matchupList = Object.entries(weekData.matchups || {});

		const games = await Promise.all(
			matchupList.map(async ([matchupId, teams], index) => {
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

				// Get the manager IDs for each current roster
				const yearManagers =
					teamManagersData.teamManagersMap[matchupsData.year];

				const awayManagers =
					yearManagers?.[away.roster_id]?.managers || [];

				const homeManagers =
					yearManagers?.[home.roster_id]?.managers || [];

				const awayManagerID = awayManagers[0];
				const homeManagerID = homeManagers[0];

				// Pull the existing Rivalry H2H calculation
				let h2h = null;

				if (awayManagerID && homeManagerID) {
					try {
						const rivalry = await getRivalryMatchups(
							awayManagerID,
							homeManagerID
						);

						if (rivalry) {
							h2h = {
								winsAway: rivalry.wins.one,
								winsHome: rivalry.wins.two,
								pointsAway: Number(rivalry.points.one || 0),
								pointsHome: Number(rivalry.points.two || 0)
							};
						}
					} catch (err) {
						console.error(
							`[scoreboard] H2H failed for ${awayTeam?.name} vs ${homeTeam?.name}:`,
							err
						);
					}
				}

				return {
					matchupId,
					gameNumber: index + 1,

					away: {
						name: awayTeam?.name || 'Unknown Team',
						logo: awayTeam?.avatar || '',
						score: Array.isArray(away.points)
							? away.points.reduce(
									(total, points) =>
										total + Number(points || 0),
									0
								)
							: Number(away.points || 0)
					},

					home: {
						name: homeTeam?.name || 'Unknown Team',
						logo: homeTeam?.avatar || '',
						score: Array.isArray(home.points)
							? home.points.reduce(
									(total, points) =>
										total + Number(points || 0),
									0
								)
							: Number(home.points || 0)
					},

					h2h,

					status: 'LIVE'
				};
			})
		);

		return games;
	};

	const loadScores = async () => {
		try {
			error = '';

			const [matchupsData, teamManagersData] = await Promise.all([
				getLeagueMatchups(true),
				getLeagueTeamManagers()
			]);

			const newGames = await buildGames(
				matchupsData,
				teamManagersData
			);

			games = newGames;

			if (currentGame >= newGames.length) {
				currentGame = 0;
			}
		} catch (err) {
			console.error('[scoreboard] Failed to load:', err);
			error = 'Unable to load MFFL matchup data.';
		} finally {
			loading = false;
		}
	};

	const nextGame = () => {
		if (games.length <= 1) return;

		transitioning = true;

		setTimeout(() => {
			currentGame = (currentGame + 1) % games.length;
			transitioning = false;
		}, SLIDE_TIME);
	};

	onMount(async () => {
		await loadScores();

		const refreshTimer = setInterval(loadScores, 60000);

		let rotationTimer;
		let stopped = false;

		const rotate = () => {
			if (stopped || games.length <= 1) return;

			rotationTimer = setTimeout(() => {
				nextGame();

				setTimeout(() => {
					if (!stopped) rotate();
				}, SLIDE_TIME);
			}, HOLD_TIME);
		};

		rotate();

		return () => {
			stopped = true;
			clearInterval(refreshTimer);
			clearTimeout(rotationTimer);
		};
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

	{:else if games.length === 0}

		<div class="message">
			NO MATCHUPS FOUND
		</div>

	{:else}

		<div class="matchup-stage">

			<div
				class:transitioning
				class="matchup-card"
			>

				<div class="game-label">
					GAME {games[currentGame].gameNumber}
					<span>•</span>
					{games.length} MATCHUPS
				</div>

				<div class="status-label">
					<span class="status-dot"></span>
					{games[currentGame].status}
				</div>

				<div class="teams">

					<div class="team">

						{#if games[currentGame].away.logo}
							<img
								src={games[currentGame].away.logo}
								alt={games[currentGame].away.name}
								class="logo"
							/>
						{:else}
							<div class="logo placeholder">?</div>
						{/if}

						<div class="team-name">
							{games[currentGame].away.name}
						</div>

						<div class="score">
							{games[currentGame].away.score.toFixed(2)}
						</div>

					</div>

					<div class="vs">
						VS

						{#if games[currentGame].h2h}
							<div class="h2h-test">
								H2H TEST<br />

								{games[currentGame].h2h.winsAway}
								-
								{games[currentGame].h2h.winsHome}

								<br />

								{games[currentGame].h2h.pointsAway.toFixed(2)}
								-
								{games[currentGame].h2h.pointsHome.toFixed(2)}
							</div>
						{:else}
							<div class="h2h-test">
								H2H DATA NOT FOUND
							</div>
						{/if}
					</div>

					<div class="team">

						{#if games[currentGame].home.logo}
							<img
								src={games[currentGame].home.logo}
								alt={games[currentGame].home.name}
								class="logo"
							/>
						{:else}
							<div class="logo placeholder">?</div>
						{/if}

						<div class="team-name">
							{games[currentGame].home.name}
						</div>

						<div class="score">
							{games[currentGame].home.score.toFixed(2)}
						</div>

					</div>

				</div>

				<div class="game-number">
					{currentGame + 1} / {games.length}
				</div>

			</div>

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

		display: flex;
		flex-direction: column;

		background:
			radial-gradient(
				ellipse at center,
				#1b222b 0%,
				#0a0d11 55%,
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
		grid-template-columns: 200px 1fr 200px;
		align-items: center;

		padding: 0 40px;

		background: rgba(0, 0, 0, 0.88);

		border-bottom: 2px solid #30363d;
	}

	.league-name {
		font-size: 38px;
		font-weight: 900;
		letter-spacing: 6px;
	}

	.header-center {
		text-align: center;
	}

	h1 {
		margin: 0;

		font-size: 34px;
		font-weight: 900;
		letter-spacing: 5px;
	}

	.season {
		margin-top: 7px;

		font-size: 16px;
		font-weight: 700;
		letter-spacing: 5px;

		color: #aaa;
	}

	.season span {
		padding: 0 10px;
		color: #777;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;

		font-size: 18px;
		font-weight: 900;
		letter-spacing: 3px;
	}

	.dot,
	.status-dot {
		display: inline-block;

		border-radius: 50%;

		background: #e21b23;

		box-shadow: 0 0 12px rgba(226, 27, 35, 0.8);
	}

	.dot {
		width: 12px;
		height: 12px;
	}

	.matchup-stage {
		flex: 1;
		min-height: 0;

		display: flex;
		align-items: center;
		justify-content: center;

		padding: 20px 60px;
	}

	.matchup-card {
		width: 100%;
		max-width: 1500px;

		text-align: center;

		animation: enter 0.9s ease both;
	}

	.matchup-card.transitioning {
		animation: exit 0.9s ease both;
	}

	.game-label {
		margin-bottom: 14px;

		font-size: 18px;
		font-weight: 800;
		letter-spacing: 5px;

		color: #999;
	}

	.game-label span {
		padding: 0 10px;
		color: #555;
	}

	.status-label {
		display: inline-flex;
		align-items: center;
		gap: 8px;

		margin-bottom: 35px;

		font-size: 15px;
		font-weight: 900;
		letter-spacing: 4px;

		color: #ddd;
	}

	.status-dot {
		width: 9px;
		height: 9px;
	}

	.teams {
		display: grid;
		grid-template-columns: 1fr 120px 1fr;
		align-items: center;

		width: 100%;
	}

	.team {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		min-width: 0;
	}

	.logo {
		width: clamp(130px, 15vw, 220px);
		height: clamp(130px, 15vw, 220px);

		margin-bottom: 28px;

		border-radius: 50%;

		object-fit: cover;

		background: #111;

		border: 3px solid #3f464d;

		box-shadow:
			0 15px 40px rgba(0, 0, 0, 0.55);
	}

	.logo.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 60px;
		font-weight: 900;
		color: #555;
	}

	.team-name {
		width: 100%;
		max-width: 90%;

		font-size: clamp(26px, 3vw, 48px);
		font-weight: 900;
		letter-spacing: 1px;
		line-height: 1.15;

		white-space: normal;
		overflow: visible;
		text-align: center;

		text-shadow:
			0 3px 10px rgba(0, 0, 0, 0.8);
	}

	.score {
		margin-top: 15px;

		font-size: clamp(55px, 6vw, 90px);
		font-weight: 900;

		font-variant-numeric: tabular-nums;

		line-height: 1;
	}

	.vs {
		font-size: 30px;
		font-weight: 900;
		letter-spacing: 4px;

		color: #777;
	}

	.h2h-test {
		margin-top: 12px;

		font-size: 12px;
		font-weight: 700;
		letter-spacing: 1px;

		line-height: 1.6;

		color: #00aaff;

		white-space: nowrap;
	}

	.game-number {
		margin-top: 50px;

		font-size: 13px;
		font-weight: 800;
		letter-spacing: 4px;

		color: #666;
	}

	.message {
		flex: 1;

		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 25px;
		font-weight: 800;
		letter-spacing: 4px;

		color: #aaa;
	}

	.message.error {
		color: #e21b23;
	}

	.bottom-bar {
		height: 38px;
		min-height: 38px;

		display: flex;
		align-items: center;
		justify-content: space-between;

		padding: 0 30px;

		background: #050505;

		border-top: 1px solid #292929;

		font-size: 10px;
		font-weight: 700;
		letter-spacing: 2px;

		color: #666;
	}

	@keyframes enter {
		from {
			opacity: 0;
			transform: translateX(100px);
		}

		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes exit {
		from {
			opacity: 1;
			transform: translateX(0);
		}

		to {
			opacity: 0;
			transform: translateX(-100px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.matchup-card,
		.matchup-card.transitioning {
			animation: none;
		}
	}
</style>
