<script>
	const title = "MFFL LIVE SCOREBOARD";
	const season = "2026 SEASON";
	const week = "WEEK 1";

	const games = [
		{
			away: "TEAM 1",
			awayScore: "0.0",
			home: "TEAM 2",
			homeScore: "0.0",
			status: "UPCOMING"
		},
		{
			away: "TEAM 3",
			awayScore: "0.0",
			home: "TEAM 4",
			homeScore: "0.0",
			status: "UPCOMING"
		},
		{
			away: "TEAM 5",
			awayScore: "0.0",
			home: "TEAM 6",
			homeScore: "0.0",
			status: "UPCOMING"
		},
		{
			away: "TEAM 7",
			awayScore: "0.0",
			home: "TEAM 8",
			homeScore: "0.0",
			status: "UPCOMING"
		},
		{
			away: "TEAM 9",
			awayScore: "0.0",
			home: "TEAM 10",
			homeScore: "0.0",
			status: "UPCOMING"
		},
		{
			away: "TEAM 11",
			awayScore: "0.0",
			home: "TEAM 12",
			homeScore: "0.0",
			status: "UPCOMING"
		},
		{
			away: "TEAM 13",
			awayScore: "0.0",
			home: "TEAM 14",
			homeScore: "0.0",
			status: "UPCOMING"
		},
		{
			away: "TEAM 15",
			awayScore: "0.0",
			home: "TEAM 16",
			homeScore: "0.0",
			status: "UPCOMING"
		}
	];
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
				{season} <span>•</span> {week}
			</div>
		</div>

		<div class="live-indicator">
			<span class="dot"></span>
			LIVE
		</div>
	</header>

	<div class="games">

		{#each games as game, i}
			<section class="game-card">

				<div class="game-header">
					<span>GAME {i + 1}</span>
					<span class="status">{game.status}</span>
				</div>

				<div class="team-row">
					<div class="team">
						<div class="logo">?</div>
						<div class="team-name">{game.away}</div>
					</div>

					<div class="score">
						{game.awayScore}
					</div>
				</div>

				<div class="team-row">
					<div class="team">
						<div class="logo">?</div>
						<div class="team-name">{game.home}</div>
					</div>

					<div class="score">
						{game.homeScore}
					</div>
				</div>

			</section>
		{/each}

	</div>

	<footer class="bottom-bar">
		<div>MFFL • 2026 SEASON</div>
		<div>WEEK 1</div>
		<div>UPDATES AUTOMATICALLY</div>
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
			radial-gradient(circle at top center, #18202a 0%, #080b0f 42%, #000 100%);

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

		background: rgba(0, 0, 0, 0.85);
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

		box-shadow: 0 0 12px rgba(226, 27, 35, 0.8);
	}

	.games {
		flex: 1;

		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, 1fr);

		gap: 14px;

		padding: 16px 22px;
	}

	.game-card {
		display: flex;
		flex-direction: column;

		min-width: 0;

		background: linear-gradient(
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
