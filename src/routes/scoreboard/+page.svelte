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
				game.status === 'in_game'
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

			const holdTime = showAllScores ? 10000 : HOLD_TIME;

			rotationTimer = setTimeout(() => {
				nextGame();

				setTimeout(() => {
					if (!stopped) rotate();
				}, SLIDE_TIME);
			}, holdTime);
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

		{#if showAllScores}

			<div class="matchup-stage">
				<div class="all-scores-card">

					<div class="all-scores-title">
						ALL SCORES
						<span>•</span>
						{games.length} MATCHUPS
					</div>

					<div class="all-scores-grid">

						{#each games as game}

							<div class="score-summary">

								<div class="summary-game">
									GAME {game.gameNumber}
								</div>

								<div
									class="summary-team"
									class:winning={game.away.score > game.home.score}
								>
									{#if game.away.logo}
										<img
											src={game.away.logo}
											alt={game.away.name}
											class="summary-logo"
										/>
									{/if}

									<span class="summary-name">
										{game.away.name}
									</span>

									<span class="summary-score">
										{game.away.score.toFixed(2)}
									</span>
								</div>

								<div class="summary-vs">
									VS
								</div>

								<div
									class="summary-team"
									class:winning={game.home.score > game.away.score}
								>
									{#if game.home.logo}
										<img
											src={game.home.logo}
											alt={game.home.name}
											class="summary-logo"
										/>
									{/if}

									<span class="summary-name">
										{game.home.name}
									</span>

									<span class="summary-score">
										{game.home.score.toFixed(2)}
									</span>
								</div>

							</div>

						{/each}

					</div>

				</div>
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

	@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&display=swap');

.scoreboard {
	position: fixed;
	inset: 0;

	display: flex;
	flex-direction: column;

	background:
		linear-gradient(
			rgba(0, 0, 0, 0.55),
			rgba(0, 0, 0, 0.55)
		),
		url('/stadium.png') center center / cover no-repeat;

	color: #fff;

	font-family:
		'Barlow Condensed',
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

	.all-scores-card {
	position: relative;
	top: -180px;

	width: 100%;
	max-width: 1100px;

	padding: 24px 25px 28px;

	text-align: center;

	background: transparent;

	border: none;

	box-shadow: none;

	animation: enter 0.9s ease both;
}

	.all-scores-card::before {
		content: '';

		position: absolute;

		top: -100px;
		left: -20%;
		right: -20%;
		bottom: -110px;

		background: url('/steel.png') center center / cover no-repeat;

		box-shadow:
			0 12px 35px rgba(0, 0, 0, 0.55),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);

		z-index: 0;

		pointer-events: none;
	}

	.all-scores-card > * {
		position: relative;
		z-index: 1;
	}

	.all-scores-title {
		position: relative;
		top: -3px;
		margin-bottom: 16px;
		font-size: 24px;
		font-weight: 900;
		letter-spacing: 5px;
		color: #222;
		text-shadow:
			0 1px 1px rgba(255, 255, 255, 0.55);
	}

	.all-scores-title span {
		padding: 0 10px;
		color: #555;
	}

	.all-scores-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px 24px;
		width: 100%;
		position: relative;
		top: -15px;
	}

	.score-summary {
		display: grid;

		grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr);

		align-items: center;

		min-height: 75px;

		padding: 7px 12px;

		background: rgba(255, 255, 255, 0.60);

		border-top: 1px solid rgba(255, 255, 255, 0.45);
		border-bottom: 1px solid rgba(0, 0, 0, 0.35);

		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.10),
			0 5px 15px rgba(0, 0, 0, 0.25);
	}

	.summary-game {
		display: none;
	}

	.summary-team {
		display: grid;

		grid-template-columns: 70px minmax(0, 1fr) auto;

		align-items: center;

		min-width: 0;

		padding: 0 8px;

		color: #222;

		text-align: left;
	}

	.summary-team.winning {
		font-weight: 900;
	}

	.summary-team.winning .summary-logo {
		animation: summaryWinnerGlow 1.8s ease-in-out infinite;
	}

	.summary-logo {
		width: 70px;
		height: 70px;

		border-radius: 50%;

		object-fit: cover;

		background: #111;

		border: 2px solid #3f464d;

		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.5);
	}

	.summary-name {
		min-width: 0;

		padding: 0 6px 0 12px;

		font-size: 16px;
		font-weight: 700;
		line-height: 3.0;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		text-shadow:
			0 1px 2px rgba(255, 255, 255, 0.35);
	}

	.summary-score {
		padding-left: 4px;

		font-size: 19px;
		font-weight: 900;

		font-variant-numeric: tabular-nums;

		color: #000;
	}

	.summary-vs {
		font-size: 13px;
		font-weight: 900;

		color: #555;
	}

	.matchup-card {
		position: relative;
		top: -180px;

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

	top: -98px;
	left: -3%;
	right: -2%;
	bottom: -100px;

	background: url('/steel.png') center center / cover no-repeat;

	box-shadow:
		0 20px 50px rgba(0, 0, 0, 0.75),
		0 0 35px rgba(30, 110, 170, 0.18),
		inset 0 1px 0 rgba(255, 255, 255, 0.16),
		inset 0 -1px 0 rgba(30, 120, 180, 0.20);

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

		margin-top: 4px;
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

	@keyframes summaryWinnerGlow {
		0%, 100% {
			filter:
				drop-shadow(0 0 3px rgba(255, 215, 0, 0.35))
				drop-shadow(0 0 8px rgba(255, 215, 0, 0.20));
		}

		50% {
			filter:
				drop-shadow(0 0 7px rgba(255, 215, 0, 0.95))
				drop-shadow(0 0 16px rgba(255, 215, 0, 0.75));
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
	}
	to {
		opacity: 1;
	}
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

	/* =========================
	   PHONE SCOREBOARD
	   ========================= */

	@media (max-width: 600px) {

		:global(html),
		:global(body) {
			width: 100%;
			height: 100%;
			overflow: hidden;
		}

		.scoreboard {
			width: 100%;
			height: 100%;
			overflow: hidden;
		}

		/* HEADER */
		.top-bar {
			height: 54px;
			min-height: 54px;
			grid-template-columns: 40px 1fr 40px;
			padding: 0 6px;
		}

		.league-name img {
			width: 34px;
			height: 34px;
		}

		h1 {
			font-size: 17px;
			letter-spacing: 1.5px;
			white-space: nowrap;
		}

		.season {
			margin-top: 1px;
			font-size: 8px;
			letter-spacing: 1.5px;
		}

		.season span {
			padding: 0 3px;
		}

		.live-indicator {
			gap: 3px;
			font-size: 9px;
			letter-spacing: 1px;
		}

		.dot {
			width: 5px;
			height: 5px;
		}

		/* MATCHUP AREA */
		.matchup-stage {
			padding: 0 2px;
			width: 100%;
			box-sizing: border-box;
		}

		.matchup-card {
			width: 100%;
			max-width: 100%;
			padding: 0 2px 5px;
			box-sizing: border-box;
		}

		.matchup-card::before {
			top: -18px;
			left: -5px;
			right: -5px;
			bottom: -25px;
		}

		/* GAME LABEL */
		.game-label {
			height: 18px;
			margin-top: 0;
			margin-bottom: 3px;
			font-size: 9px;
			letter-spacing: 1.5px;
			line-height: 18px;
		}

		.game-label span {
			padding: 0 3px;
		}

		/* TEAMS */
		.teams {
			grid-template-columns: minmax(0, 1fr) 42px minmax(0, 1fr);
			width: 100%;
			gap: 0;
		}

		.team {
			min-width: 0;
			width: 100%;
		}

		/* TEAM NAME */
		.team-name {
			width: 100%;
			max-width: 100%;
			font-size: 11px;
			font-weight: 800;
			letter-spacing: 0;
			line-height: 1.05;
			margin-bottom: 8px;
			padding: 0 2px;
			white-space: normal;
			overflow: hidden;
			text-align: center;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}

		/* LOGOS */
		.logo {
			width: 46px;
			height: 46px;
			margin-bottom: 5px;
			border-width: 2px;
		}

		/* SCORE */
		.score {
			margin-top: 3px;
			font-size: 27px;
			line-height: 1;
		}

		/* CENTER */
		.center-column {
			width: 42px;
			min-width: 42px;
		}

		.vs {
			font-size: 18px;
			letter-spacing: 1px;
		}

		/* H2H */
		.h2h-panel {
			width: 42px;
			margin-top: 5px;
			padding: 3px 0 2px;
			border-top-width: 1px;
			border-bottom-width: 1px;
		}

		.h2h-title {
			margin-bottom: 2px;
			font-size: 6px;
			letter-spacing: 0.5px;
		}

		.h2h-line {
			width: 80%;
			margin: 0 auto 2px;
		}

		.h2h-wins,
		.h2h-points {
			grid-template-columns: 1fr 5px 1fr;
		}

		.h2h-wins {
			margin-bottom: 2px;
		}

		.h2h-number {
			font-size: 15px;
		}

		.h2h-points-number {
			font-size: 8px;
		}

		.h2h-label {
			margin-top: 0;
			font-size: 6px;
			letter-spacing: 0;
		}

		.h2h-divider {
			font-size: 6px;
		}

		/* ALL SCORES */
		.all-scores-card {
			width: 100%;
			max-width: 100%;
			padding: 10px 4px 12px;
			box-sizing: border-box;
		}

		.all-scores-card::before {
			top: -15px;
			left: -4px;
			right: -4px;
			bottom: -20px;
		}

		.all-scores-title {
			top: -2px;
			margin-bottom: 7px;
			font-size: 14px;
			letter-spacing: 1.5px;
		}

		.all-scores-title span {
			padding: 0 3px;
		}

		.all-scores-grid {
			grid-template-columns: 1fr;
			gap: 5px;
			top: -3px;
		}

		.score-summary {
			grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr);
			min-height: 48px;
			padding: 3px 4px;
			box-sizing: border-box;
		}

		.summary-team {
			grid-template-columns: 34px minmax(0, 1fr) auto;
			padding: 0 2px;
		}

		.summary-logo {
			width: 32px;
			height: 32px;
		}

		.summary-name {
			padding: 0 2px 0 5px;
			font-size: 10px;
			font-weight: 700;
			line-height: 1;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.summary-score {
			padding-left: 1px;
			font-size: 11px;
		}

		.summary-vs {
			font-size: 8px;
		}

		/* FOOTER */
		.bottom-bar {
			height: 23px;
			min-height: 23px;
			padding: 0 7px;
			font-size: 7px;
			letter-spacing: 0.5px;
		}
	}
</style>
