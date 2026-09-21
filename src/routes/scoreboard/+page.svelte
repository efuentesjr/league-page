<script>
	import { onMount } from 'svelte';
	import {
		getLeagueMatchups,
		getLeagueTeamManagers,
		getTeamFromTeamManagers,
		getRivalryMatchups,
		getNflGames,
		getNflState
	} from '$lib/utils/helper';

	const title = 'MFFL LIVE SCOREBOARD';
	const season = '2026 SEASON';
	let weekNumber = 1;

	const HOLD_TIME = 5000;
	const SLIDE_TIME = 900;

	let games = [];
	let loading = true;
	let error = '';
	let currentGame = 0;
	let showAllScores = false;
	let transitioning = false;

	const buildGames = async (matchupsData, teamManagersData) => {
		const nflGames = await getNflGames(2026, weekNumber);

const isLive = nflGames.some(
	(game) =>
		game.status === 'in_game' ||
		game.status === 'pre_game'
);

		console.log('[scoreboard] NFL games:', nflGames);
		console.log(
			'[scoreboard] LIVE statuses:',
			nflGames.map((game) => ({
				game_id: game.game_id,
				status: game.status,
				home: game.home,
				away: game.away,
				week: game.week
			}))
		);

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

				const yearManagers =
					teamManagersData.teamManagersMap[matchupsData.year];

				const awayManagers =
					yearManagers?.[away.roster_id]?.managers || [];

				const homeManagers =
					yearManagers?.[home.roster_id]?.managers || [];

				const awayManagerID = awayManagers[0];
				const homeManagerID = homeManagers[0];

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

				const allPlayersDone =
					nflGames.length > 0 &&
					nflGames.every((game) => game.status === 'complete');

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
					allPlayersDone,
					isLive,
					status: 'LIVE'
				};
			})
		);

		return games;
	};

	const loadScores = async () => {
		try {
			error = '';

			const nflState = await getNflState();

			if (nflState?.week) {
				weekNumber = Number(nflState.week);
			}

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

	console.log(
		'[scoreboard] ROTATION:',
		'currentGame =',
		currentGame,
		'showAllScores =',
		showAllScores,
		'games =',
		games.length
	);

	transitioning = true;

	setTimeout(() => {
		if (showAllScores) {
			console.log('[scoreboard] ALL SCORES → GAME 1');

			showAllScores = false;
			currentGame = 0;
		} else if (currentGame === games.length - 1) {
			console.log('[scoreboard] LAST GAME → ALL SCORES');

			showAllScores = true;
		} else {
			console.log(
				'[scoreboard] NEXT GAME →',
				currentGame + 2
			);

			currentGame += 1;
		}

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
			<img src="/badge.png" alt="MFFL" />
		</div>

		<div class="header-center">
			<h1>{title}</h1>

			<div class="season">
				{season} <span>•</span> WEEK {weekNumber}
			</div>
		</div>

		{#if games[currentGame]?.isLive}
			<div class="live-indicator">
				<span class="dot"></span>
				LIVE
			</div>
		{/if}

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

				<div class="teams">

					<!-- AWAY TEAM -->
					<div
						class="team"
						class:winning={
							games[currentGame].away.score >
							games[currentGame].home.score
						}
						class:completed={games[currentGame].allPlayersDone}
					>

						<div class="team-name">
							{games[currentGame].away.name}
						</div>

						{#if games[currentGame].away.logo}
							<img
								src={games[currentGame].away.logo}
								alt={games[currentGame].away.name}
								class="logo"
							/>
						{:else}
							<div class="logo placeholder">?</div>
						{/if}

						<div class="score">
							{games[currentGame].away.score.toFixed(2)}
						</div>

					</div>

					<!-- CENTER -->
					<div class="center-column">

						<div class="vs">
							VS
						</div>

						{#if games[currentGame].h2h}

							<div class="h2h-panel">

								<div class="h2h-title">
									HEAD TO HEAD
								</div>

								<div class="h2h-line"></div>

								<div class="h2h-wins">

									<div class="h2h-side">
										<div class="h2h-number">
											{games[currentGame].h2h.winsAway}
										</div>

										<div class="h2h-label">
											WINS
										</div>
									</div>

									<div class="h2h-divider">
										-
									</div>

									<div class="h2h-side">
										<div class="h2h-number">
											{games[currentGame].h2h.winsHome}
										</div>

										<div class="h2h-label">
											WINS
										</div>
									</div>

								</div>

								<div class="h2h-points">

									<div class="h2h-side">
										<div class="h2h-points-number">
											{games[currentGame].h2h.pointsAway.toFixed(2)}
										</div>

										<div class="h2h-label">
											POINTS
										</div>
									</div>

									<div class="h2h-divider">
										-
									</div>

									<div class="h2h-side">
										<div class="h2h-points-number">
											{games[currentGame].h2h.pointsHome.toFixed(2)}
										</div>

										<div class="h2h-label">
											POINTS
										</div>
									</div>

								</div>

							</div>

						{/if}

					</div>

					<!-- HOME TEAM -->
					<div
						class="team"
						class:winning={
							games[currentGame].home.score >
							games[currentGame].away.score
						}
						class:completed={games[currentGame].allPlayersDone}
					>

						<div class="team-name">
							{games[currentGame].home.name}
						</div>

						{#if games[currentGame].home.logo}
							<img
								src={games[currentGame].home.logo}
								alt={games[currentGame].home.name}
								class="logo"
							/>
						{:else}
							<div class="logo placeholder">?</div>
						{/if}

						<div class="score">
							{games[currentGame].home.score.toFixed(2)}
						</div>

					</div>

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

	@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;500;600;700;800;900&display=swap');

	.scoreboard {
		position: fixed;
		inset: 0;

		display: flex;
		flex-direction: column;

		background:
			radial-gradient(
				ellipse at 50% 42%,
				rgba(20, 55, 85, 0.55) 0%,
				rgba(10, 25, 40, 0.32) 30%,
				rgba(5, 10, 16, 0.9) 65%,
				#000 100%
			);

		color: #fff;

		font-family:
			'Roboto Condensed',
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
		display: flex;
		align-items: center;
	}

	.league-name img {
		width: 72px;
		height: 72px;
		object-fit: contain;
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

		padding: 0px 4vw;
	}

	.matchup-card {
		position: relative;
		top: -20px;

		width: 100%;
		max-width: 1500px;

		padding: 0 25px 14px;

		text-align: center;

		background: transparent;

		border: none;

		box-shadow: none;

		animation: enter 0.9s ease both;
	}

	.matchup-card::before {
		content: '';

		position: absolute;

		top: -80px;
		left: -3%;
		right: -3%;
		bottom: -100px;

		background: url('/steel-background.jpg') center center / cover no-repeat;

		box-shadow:
			0 12px 35px rgba(0, 0, 0, 0.55),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);

		z-index: 0;

		pointer-events: none;
	}

	.matchup-card > * {
		position: relative;
		z-index: 1;
	}

	.matchup-card.transitioning {
		animation: exit 0.9s ease both;
	}

	.game-label {
		height: 30px;

		margin-top: -12px;
		margin-bottom: 10px;

		font-size: 22px;
		font-weight: 800;
		letter-spacing: 5px;
		line-height: 30px;

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

		font-size: 19px;
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
		grid-template-columns: 1fr 240px 1fr;
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

	.center-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		min-width: 0;
	}

	.logo {
		width: clamp(110px, 12vw, 180px);
		height: clamp(110px, 12vw, 180px);

		margin-bottom: 18px;

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

		font-size: clamp(20px, 1.5vw, 38px);
		font-weight: 900;
		letter-spacing: 1px;
		line-height: 1.15;
		margin-bottom: 50px;

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

	/* LIVE LEADER — BLACK PULSING GLOW */
	.team.winning:not(.completed) .logo {
		animation: liveLeaderGlow 1.8s ease-in-out infinite !important;

		filter:
			drop-shadow(0 0 5px rgba(0, 0, 0, 0.6))
			drop-shadow(0 0 14px rgba(0, 0, 0, 0.8))
			drop-shadow(0 0 28px rgba(0, 0, 0, 0.7));
	}

	/* COMPLETED WINNER — GOLD PULSING GLOW */
	.team.winning.completed .logo,
	.team.winning.completed .score {
		animation: completedWinnerGlow 1.8s ease-in-out infinite !important;
	}

	/* BLACK LIVE LEADER */
	@keyframes liveLeaderGlow {
		0%, 100% {
			filter:
				drop-shadow(0 0 4px rgba(0, 0, 0, 0.4))
				drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
		}

		50% {
			filter:
				drop-shadow(0 0 8px rgba(0, 0, 0, 1))
				drop-shadow(0 0 20px rgba(0, 0, 0, 1))
				drop-shadow(0 0 40px rgba(0, 0, 0, 0.9));
		}
	}

	/* GOLD COMPLETED WINNER */
	@keyframes completedWinnerGlow {
		0%, 100% {
			box-shadow:
				0 0 5px rgba(255, 215, 0, 0.35),
				0 0 12px rgba(255, 215, 0, 0.25),
				0 15px 40px rgba(0, 0, 0, 0.55);
		}

		50% {
			box-shadow:
				0 0 12px rgba(255, 215, 0, 1),
				0 0 30px rgba(255, 215, 0, 0.95),
				0 0 55px rgba(255, 215, 0, 0.75),
				0 15px 40px rgba(0, 0, 0, 0.55);
		}
	}

	.vs {
		font-size: 46px;
		font-weight: 900;
		letter-spacing: 4px;

		color: #777;
	}

	.h2h-panel {
		width: 240px;

		margin-top: 16px;
		padding: 8px 0 6px;

		background: transparent;

		border-top: 2px solid #3b4249;
		border-bottom: 2px solid #3b4249;
	}

	.h2h-title {
		margin-bottom: 6px;

		font-size: 20px;
		font-weight: 900;
		letter-spacing: 3px;

		color: #aab2ba;
	}

	.h2h-line {
		width: 85%;

		height: 1px;

		margin: 0 auto 7px;

		background: #30363d;
	}

	.h2h-wins,
	.h2h-points {
		display: grid;
		grid-template-columns: 1fr 20px 1fr;
		align-items: center;
	}

	.h2h-wins {
		margin-bottom: 6px;
	}

	.h2h-side {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.h2h-number {
		font-size: 40px;
		font-weight: 900;

		line-height: 1;

		color: #000;
	}

	.h2h-points-number {
		font-size: 20px;
		font-weight: 800;

		font-variant-numeric: tabular-nums;

		color: #000;
	}

	.h2h-label {
		margin-top: 3px;

		font-size: 16px;
		font-weight: 800;
		letter-spacing: 2px;

		color: #777;
	}

	.h2h-divider {
		font-size: 13px;
		font-weight: 700;

		color: #555;
	}

	.game-number {
		margin-top: 40px;

		font-size: 20px;
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

		font-size: 14px;
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
