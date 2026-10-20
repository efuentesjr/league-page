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
	import { getLiveWinProbabilities, formatWinPct } from '$lib/utils/helperFunctions/liveWinProbability';

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

	const buildGames = async (matchupsData, teamManagersData, winProbs = null) => {
		const winFor = (rosterID) =>
			winProbs && Number(winProbs.week) === Number(weekNumber)
				? winProbs.probs[String(rosterID)] ?? null
				: null;

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
						winPct: winFor(away.roster_id),
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
						winPct: winFor(home.roster_id),
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

			let winProbs = null;
			try {
				winProbs = await getLiveWinProbabilities(matchupsData.matchupWeeks);
			} catch (err) {
				console.error('[scoreboard] Win probability failed:', err);
			}

			const newGames = await buildGames(
				matchupsData,
				teamManagersData,
				winProbs
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

<!--
	LAYOUT
	------
	.stage is sized exactly like the stadium image would be with
	"background-size: cover", so the image's big screen is always
	at the same percentage spot inside it. .screen sits on that
	spot, and everything inside sizes itself from the screen
	(cqw / cqh units), so it stays centered on every window size.
-->
<div class="scoreboard">
	<div class="stage">
		<div class="screen">
			<div class="screen-content" class:expanded={showAllScores && !loading && !error && games.length > 0}>

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

				{:else if showAllScores}

					<div class="all-scores">

						<div class="all-scores-title">
							ALL SCORES
							<span>•</span>
							{games.length} MATCHUPS
						</div>

						<div class="all-scores-grid">

							{#each games as game}

								<div class="score-summary">

									{#each [game.away, game.home] as team, i}
										{@const other = i === 0 ? game.home : game.away}

										<div
											class="summary-team"
											class:winning={team.score > other.score}
										>
											{#if team.logo}
												<img
													src={team.logo}
													alt={team.name}
													class="summary-logo"
												/>
											{:else}
												<div class="summary-logo placeholder">?</div>
											{/if}

											<span class="summary-name">
												{team.name}
											</span>

											<span class="summary-score">
												{team.score.toFixed(2)}
												{#if team.winPct != null}
													<small class="summary-win">{formatWinPct(team.winPct)}</small>
												{/if}
											</span>
										</div>
									{/each}

								</div>

							{/each}

						</div>

					</div>

				{:else}

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
									<span>{games[currentGame].away.name}</span>
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

										<div class="h2h-row">
											<div class="h2h-side">
												<div class="h2h-number">
													{games[currentGame].h2h.winsAway}
												</div>
												<div class="h2h-label">WINS</div>
											</div>

											<div class="h2h-side">
												<div class="h2h-number">
													{games[currentGame].h2h.winsHome}
												</div>
												<div class="h2h-label">WINS</div>
											</div>
										</div>

										<div class="h2h-row">
											<div class="h2h-side">
												<div class="h2h-points-number">
													{games[currentGame].h2h.pointsAway.toFixed(2)}
												</div>
												<div class="h2h-label">POINTS</div>
											</div>

											<div class="h2h-side">
												<div class="h2h-points-number">
													{games[currentGame].h2h.pointsHome.toFixed(2)}
												</div>
												<div class="h2h-label">POINTS</div>
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
									<span>{games[currentGame].home.name}</span>
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

						{#if games[currentGame].away.winPct != null && games[currentGame].home.winPct != null}
							<div class="winBar" aria-label="Chance to win">
								<span class="winPct">{formatWinPct(games[currentGame].away.winPct)}</span>
								<span class="winTrack">
									<span class="winFill" style="width: {games[currentGame].away.winPct}%"></span>
								</span>
								<span class="winPct">{formatWinPct(games[currentGame].home.winPct)}</span>
							</div>
							<div class="winLabel">Chance to win</div>
						{/if}

					</div>

				{/if}

			</div>
		</div>
	</div>
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

	/* ============================================================
	   STAGE + SCREEN
	   ============================================================
	   stadium.png is 1362 x 777. Its big screen (inside the
	   silver frame) runs from x 276-1079 and y 137-471.
	   If the background image is ever replaced, update the
	   ratio in .stage and the percentages in .screen.
	   ============================================================ */

	.scoreboard {
		position: fixed;
		inset: 0;
		overflow: hidden;

		background: #000;
		color: #fff;

		font-family:
			'Barlow Condensed',
			Arial,
			Helvetica,
			sans-serif;

		container-type: size;
		container-name: page;
	}

	.stage {
		position: absolute;
		left: 50%;
		top: 50%;

		/* same size the image gets with background-size: cover */
		width: max(100cqw, calc(100cqh * 1362 / 777));
		height: max(100cqh, calc(100cqw * 777 / 1362));

		transform: translate(-50%, -50%);

		background:
			linear-gradient(
				rgba(0, 0, 0, 0.55),
				rgba(0, 0, 0, 0.55)
			),
			url('/stadium.png') 0 0 / 100% 100% no-repeat;
	}

	.screen {
		position: absolute;
		left: 20.26%;
		top: 17.63%;
		width: 58.96%;
		height: 42.99%;
	}

	/*
	 * On a tall phone the screen is wider than the phone itself,
	 * so the content is kept within the visible width.
	 * (100cqw here is the width of the whole page.)
	 */
	.screen-content {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;

		width: min(100%, calc(100cqw - 16px));

		transform: translateX(-50%);

		container-type: size;
		container-name: screen;

		box-sizing: border-box;
		text-align: center;
	}

	/*
	 * Tall phones: the screen only covers ~40% of the height,
	 * so the ALL SCORES list is allowed to run down past it.
	 * (Here 100cqh is the height of the whole page; the screen
	 * starts 17.63% of the way down.)
	 */
	@container page (aspect-ratio < 0.8) {
		.screen-content.expanded {
			bottom: auto;
			height: calc(100cqh * 0.78);
		}
	}

	/* ============================================================
	   MESSAGES
	   ============================================================ */

	.message {
		height: 100%;

		display: flex;
		align-items: center;
		justify-content: center;

		padding: 0 4cqw;

		font-size: min(7cqh, 4cqw);
		font-weight: 800;
		letter-spacing: 0.15em;

		color: #aaa;
	}

	.message.error {
		color: #e21b23;
	}

	/* ============================================================
	   SINGLE MATCHUP
	   ============================================================ */

	.matchup-card {
		height: 100%;
		box-sizing: border-box;

		display: flex;
		flex-direction: column;
		justify-content: center;

		padding: 3cqh 2cqw;

		animation: enter 0.9s ease both;
	}

	.matchup-card.transitioning {
		animation: exit 0.9s ease both;
	}

	.game-label {
		margin-bottom: 2cqh;

		font-size: min(5.5cqh, 3.2cqw);
		font-weight: 800;
		letter-spacing: 0.25em;
		line-height: 1;

		color: #999;
	}

	.game-label span {
		padding: 0 0.4em;
		color: #555;
	}

	.teams {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 24% minmax(0, 1fr);
		align-items: center;
	}

	.team {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		min-width: 0;
	}

	.team-name {
		width: 100%;
		height: 2.3em;

		display: flex;
		align-items: flex-end;
		justify-content: center;

		margin-bottom: 2cqh;

		font-size: min(7cqh, 4.4cqw);
		font-weight: 900;
		letter-spacing: 0.02em;
		line-height: 1.12;

		text-shadow: 0 3px 10px rgba(0, 0, 0, 0.8);
	}

	.team-name span {
		max-width: 95%;

		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: break-word;
	}

	.logo {
		width: min(28cqh, 18cqw);
		height: min(28cqh, 18cqw);

		border-radius: 50%;
		object-fit: cover;
		box-sizing: border-box;

		background: #111;
		border: max(2px, 0.6cqh) solid #3f464d;

		box-shadow: 0 1.5cqh 4cqh rgba(0, 0, 0, 0.55);
	}

	.logo.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;

		font-size: min(14cqh, 8cqw);
		font-weight: 900;
		color: #555;
	}

	.score {
		margin-top: 2cqh;

		font-size: min(19cqh, 11cqw);
		font-weight: 900;
		font-variant-numeric: tabular-nums;
		line-height: 1;

		text-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
	}

	.center-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		min-width: 0;
	}

	.vs {
		font-size: min(11cqh, 6cqw);
		font-weight: 900;
		letter-spacing: 0.08em;
		line-height: 1;

		color: #8a96a3;
	}

	.h2h-panel {
		width: 100%;
		box-sizing: border-box;

		margin-top: 3cqh;
		padding: 1.5cqh 0;

		border-top: max(1px, 0.4cqh) solid #3b4249;
		border-bottom: max(1px, 0.4cqh) solid #3b4249;
	}

	.h2h-title {
		margin-bottom: 1.5cqh;

		font-size: min(4.2cqh, 2.3cqw);
		font-weight: 900;
		letter-spacing: 0.12em;

		color: #aab2ba;
	}

	.h2h-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.h2h-row + .h2h-row {
		margin-top: 1.5cqh;
	}

	.h2h-side {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}

	.h2h-number {
		font-size: min(9cqh, 5cqw);
		font-weight: 900;
		line-height: 1;

		color: #e8eef3;
	}

	.h2h-points-number {
		font-size: min(4.2cqh, 2.4cqw);
		font-weight: 800;
		font-variant-numeric: tabular-nums;

		color: #e8eef3;
	}

	.h2h-label {
		margin-top: 0.3em;

		font-size: min(3.2cqh, 1.8cqw);
		font-weight: 800;
		letter-spacing: 0.1em;

		color: #8a96a3;
	}

	/* LIVE LEADER — NEON BLUE PULSING GLOW */
	.team.winning:not(.completed) .logo {
		animation: liveLeaderGlow 1.8s ease-in-out infinite;
	}

	/* COMPLETED WINNER — GOLD PULSING GLOW */
	.team.winning.completed .logo,
	.team.winning.completed .score {
		animation: completedWinnerGlow 1.8s ease-in-out infinite;
	}

	/* live win probability */
	.winBar {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 1.5cqw;
		margin: 4cqh 6cqw 0;
		font-size: min(5cqh, 2.8cqw);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.winTrack {
		position: relative;
		height: max(4px, 1.4cqh);
		overflow: hidden;
		background: #7d8ea6;
		box-shadow: 0 0 10px rgba(125, 142, 166, 0.5);
	}

	.winFill {
		position: absolute;
		inset: 0 auto 0 0;
		background: #38e8ff;
		box-shadow: 0 0 10px rgba(56, 232, 255, 0.8);
		transition: width 0.6s ease;
	}

	.winLabel {
		margin-top: 1cqh;
		font-size: min(3.2cqh, 1.8cqw);
		font-weight: 700;
		letter-spacing: 0.12em;
		color: #8a96a3;
	}

	.summary-win {
		display: block;
		font-size: 0.6em;
		font-weight: 700;
		color: #8a96a3;
		text-align: right;
	}

	/* ============================================================
	   ALL SCORES
	   ============================================================ */

	.all-scores {
		height: 100%;
		box-sizing: border-box;

		display: flex;
		flex-direction: column;

		padding: 4cqh 2cqw 3cqh;

		animation: enter 0.9s ease both;
	}

	.all-scores-title {
		margin-bottom: 3cqh;

		font-size: min(6cqh, 3.4cqw);
		font-weight: 900;
		letter-spacing: 0.2em;
		line-height: 1;

		background: linear-gradient(
			to bottom,
			#e8f7ff 0%,
			#9edfff 20%,
			#008cff 45%,
			#0066cc 70%,
			#c9efff 100%
		);

		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.all-scores-title span {
		padding: 0 0.4em;
	}

	.all-scores-grid {
		flex: 1;
		min-height: 0;

		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-auto-rows: minmax(0, 1fr);
		gap: 2cqh 2cqw;
	}

	.score-summary {
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 1cqh;

		min-width: 0;
		min-height: 0;
		box-sizing: border-box;

		padding: 0.8cqh 1.2cqw;

		background: rgba(0, 10, 30, 0.55);
		border: 1px solid rgba(110, 170, 255, 0.25);
		border-radius: 1.2cqh;
	}

	.summary-team {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 1cqw;

		min-width: 0;
		text-align: left;

		opacity: 0.8;
	}

	.summary-team.winning {
		opacity: 1;
	}

	.summary-team.winning .summary-logo {
		animation: summaryWinnerGlow 1.8s ease-in-out infinite;
	}

	.summary-logo {
		width: min(7cqh, 3.2cqw);
		height: min(7cqh, 3.2cqw);

		border-radius: 50%;
		object-fit: cover;
		box-sizing: border-box;

		background: #111;
		border: 1px solid #3f464d;
	}

	.summary-logo.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;

		font-size: min(6cqh, 2.2cqw);
		font-weight: 900;
		color: #555;
	}

	.summary-name {
		min-width: 0;

		font-size: min(4.4cqh, 2.1cqw);
		font-weight: 800;
		line-height: 1.1;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
	}

	.summary-score {
		font-size: min(5cqh, 2.4cqw);
		font-weight: 900;
		font-variant-numeric: tabular-nums;

		text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
	}

	.summary-team.winning .summary-score {
		color: #7fd3ff;
	}

	/* ============================================================
	   NARROW SCREENS (phones held upright, tablets)
	   The screen box is close to square here, so give the
	   logos/scores more room and use 2 columns of score cards.
	   ============================================================ */

	@container screen (aspect-ratio < 1.6) {
		.game-label {
			font-size: min(5cqh, 3.6cqw);
			letter-spacing: 0.15em;
		}

		.teams {
			grid-template-columns: minmax(0, 1fr) 30% minmax(0, 1fr);
		}

		.team-name {
			font-size: min(6cqh, 5cqw);
		}

		.logo {
			width: min(25cqh, 24cqw);
			height: min(25cqh, 24cqw);
		}

		.score {
			font-size: min(16cqh, 9.5cqw);
		}

		.h2h-title {
			font-size: min(3.6cqh, 2.6cqw);
			letter-spacing: 0.05em;
			white-space: nowrap;
		}

		.h2h-row {
			column-gap: 2cqw;
		}

		.h2h-number {
			font-size: min(8cqh, 7cqw);
		}

		.h2h-points-number {
			font-size: min(3.8cqh, 2.9cqw);
		}

		.h2h-label {
			font-size: min(2.8cqh, 2.4cqw);
			letter-spacing: 0.05em;
		}

		.all-scores-title {
			font-size: min(5cqh, 4.5cqw);
			letter-spacing: 0.12em;
		}

		.all-scores-grid {
			gap: 2cqh 2cqw;
		}

		.summary-team {
			gap: 2cqw;
		}

		.summary-logo {
			width: min(7cqh, 8cqw);
			height: min(7cqh, 8cqw);
		}

		.summary-logo {
			width: min(6cqh, 5cqw);
			height: min(6cqh, 5cqw);
		}

		.summary-name {
			font-size: min(3.6cqh, 2.6cqw);
		}

		.summary-score {
			font-size: min(4cqh, 3cqw);
		}
	}

	/* Tall, narrow box (phone ALL SCORES): one column, full names */
	@container screen (aspect-ratio < 0.8) {
		.all-scores {
			padding: 2cqh 1cqw;
		}

		.all-scores-title {
			margin-bottom: 2cqh;
			font-size: min(3.6cqh, 5cqw);
		}

		.all-scores-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 1.2cqh;
		}

		.score-summary {
			padding: 0.6cqh 3cqw;
			gap: 0.4cqh;
		}

		.summary-team {
			gap: 3cqw;
		}

		.summary-logo {
			width: min(3.8cqh, 9cqw);
			height: min(3.8cqh, 9cqw);
		}

		.summary-name {
			font-size: min(2.6cqh, 4.4cqw);
		}

		.summary-score {
			font-size: min(2.9cqh, 4.8cqw);
		}
	}

	/* ============================================================
	   ANIMATIONS
	   ============================================================ */

	@keyframes liveLeaderGlow {
		0%, 100% {
			filter:
				drop-shadow(0 0 4px rgba(0, 140, 255, 0.40))
				drop-shadow(0 0 10px rgba(0, 140, 255, 0.30));
		}

		50% {
			filter:
				drop-shadow(0 0 8px rgba(0, 140, 255, 1))
				drop-shadow(0 0 20px rgba(0, 140, 255, 0.85))
				drop-shadow(0 0 40px rgba(0, 140, 255, 0.65));
		}
	}

	@keyframes summaryWinnerGlow {
		0%, 100% {
			filter:
				drop-shadow(0 0 3px rgba(0, 191, 255, 0.35))
				drop-shadow(0 0 8px rgba(0, 191, 255, 0.20));
		}

		50% {
			filter:
				drop-shadow(0 0 7px rgba(0, 191, 255, 0.95))
				drop-shadow(0 0 16px rgba(0, 191, 255, 0.75));
		}
	}

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

	@keyframes enter {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes exit {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	@media (prefers-reduced-motion: reduce) {
		.matchup-card,
		.matchup-card.transitioning,
		.all-scores {
			animation: none;
		}
	}
</style>
