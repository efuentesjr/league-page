<script>
    import { gotoManager } from '$lib/utils/helper';
	import { getAvatarFromTeamManagers, getNestedTeamNamesFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	export let podium, leagueTeamManagers;

	const { year, champion, second, third, divisions, toilet } = podium;

	// Division logos (same art as the Rosters page). Matched by name so
	// older seasons still get the right badge; otherwise by order.
	const DIVISION_ORDER = ['east', 'west', 'south', 'north'];
	const bannerFor = (division, i) => {
		if (!division.name) return null;
		const byName = DIVISION_ORDER.indexOf(String(division.name).trim().toLowerCase());
		return `/division-${(byName >= 0 ? byName : i) + 1}-banner.png`;
	};

	const go = (rosterID) => gotoManager({ year, leagueTeamManagers, rosterID });
	const key = (rosterID) => (e) => (e.key === 'Enter' || e.key === ' ') && go(rosterID);
	const winners = divisions.filter((d) => d.rosterID);
</script>

<style>
	/* ============================================================
	   TROPHY ROOM — one panel per season, same look as Power Rankings
	   ============================================================ */
	.awards {
		--gold: #e5b52a;
		--silver: #c9d3e0;
		--bronze: #d08a4e;
		position: relative;
		width: 100%;
		margin: 0 auto 28px;
		padding: 22px 18px 28px;
		box-sizing: border-box;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		color: var(--mf-text);
		background:
			linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
			linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--gold) 16%, transparent), transparent 55%),
			var(--mf-bg);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--gold);
		clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
		z-index: 1;
	}

	.seasonHeader {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		margin: 0 4px 10px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--mf-line);
	}

	.seasonTitle {
		margin: 0;
		font-size: 2.2rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.02em;
		color: var(--gold);
		text-shadow: 0 0 22px color-mix(in srgb, var(--gold) 45%, transparent);
	}

	.seasonSub {
		font-size: 0.85rem;
		color: var(--mf-dim);
		text-align: right;
	}

	.seasonSub strong {
		color: var(--mf-text);
	}

	.banner {
		display: block;
		width: 65%;
		max-width: 450px;
		margin: 18px auto 0;
		filter: drop-shadow(0 0 16px color-mix(in srgb, var(--gold) 30%, transparent));
	}

	/* --- podium (art + positions kept) --- */
	#podium {
		width: 600px;
		height: 500px;
		position: relative;
		margin: 10px auto 24px;
	}

	.podiumImage {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: auto;
		z-index: 3;
	}

	.champ {
		--ring: var(--gold);
		position: absolute;
		width: 20%;
		height: auto;
		aspect-ratio: 1;
		object-fit: cover;
		transform: translate(-50%, -50%);
		border-radius: 100%;
		border: 2px solid var(--ring);
		background-color: var(--mf-panel-2);
		box-shadow: 0 0 18px color-mix(in srgb, var(--ring) 55%, transparent);
	}

	.laurel {
		position: absolute;
		width: 33%;
		height: auto;
		transform: translate(-50%, -50%);
		bottom: 56.6%;
		left: 50%;
		pointer-events: none;
	}

	.first { bottom: 70%; left: 50%; }
	.second { bottom: 43%; left: 20%; --ring: var(--silver); }
	.third { bottom: 39%; left: 80%; --ring: var(--bronze); }

	.label {
		--ring: var(--gold);
		position: absolute;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 34px;
		padding: 5px 22px 6px;
		white-space: nowrap;
		line-height: 1.15em;
		text-align: center;
		font-weight: 600;
		color: var(--mf-text);
		background: linear-gradient(180deg, color-mix(in srgb, var(--ring) 18%, transparent), transparent 85%), var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--ring);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
		z-index: 4;
	}

	.place {
		font-size: 0.62em;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ring);
	}

	.firstLabel { bottom: 60%; left: 50%; }
	.secondLabel { bottom: 40%; left: 20%; --ring: var(--silver); }
	.thirdLabel { bottom: 36%; left: 80%; --ring: var(--bronze); }

	/* --- section headers --- */
	.sectionHead {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 26px 4px 14px;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--mf-dim);
	}

	.sectionHead::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--mf-line);
	}

	/* --- division champions --- */
	.divisions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 12px;
	}

	.division {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 14px 10px 16px;
		text-align: center;
		background:
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-ion) 14%, transparent), transparent 70%),
			var(--mf-panel);
		border: 1px solid var(--mf-line);
		cursor: pointer;
		transition: border-color 0.15s ease, background-color 0.15s ease;
	}

	.division:hover,
	.division:focus-visible {
		border-color: var(--mf-line-strong);
		background-color: var(--mf-panel-2);
		outline: none;
	}

	.divisionLogo {
		width: 100%;
		max-width: 170px;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		background: #000;
		border: 1px solid var(--mf-line-strong);
		box-shadow: 0 0 14px var(--mf-ion-glow);
		clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
	}

	.divisionName {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mf-ion);
	}

	.leaderBlock {
		position: relative;
		width: 80px;
		height: 112px;
	}

	.divisionLeader {
		position: absolute;
		width: 70px;
		height: 70px;
		object-fit: cover;
		transform: translate(-50%, 0%);
		top: 0;
		left: 50%;
		border-radius: 100%;
		border: 2px solid var(--gold);
		background-color: var(--mf-panel-2);
		box-shadow: 0 0 12px color-mix(in srgb, var(--gold) 45%, transparent);
		z-index: 3;
	}

	.medal {
		position: absolute;
		width: 40px;
		height: auto;
		transform: translate(-50%, 0%);
		bottom: 0;
		left: 50%;
		z-index: 2;
	}

	.teamName {
		font-weight: 600;
		line-height: 1.2;
		color: var(--mf-text);
	}

	/* --- toilet bowl --- */
	.toiletParent {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 6px 12px 18px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-left: 3px solid var(--mf-down);
		text-align: center;
	}

	.toilet-banner {
		display: block;
		width: 50%;
		max-width: 320px;
		margin: 14px auto 0;
	}

	.toiletBowl {
		position: relative;
		width: 200px;
		height: 176px;
		margin: 8px auto;
		cursor: pointer;
	}

	.toiletWinner {
		position: absolute;
		width: 62px;
		height: 62px;
		object-fit: cover;
		transform: translate(-50%, 0%);
		top: 18px;
		left: 55%;
		border-radius: 100%;
		border: 2px solid var(--mf-down);
		background-color: var(--mf-panel-2);
		z-index: 3;
	}

	.toilet {
		position: absolute;
		width: 100%;
		height: auto;
		transform: translate(-50%, 0%);
		bottom: 0;
		left: 50%;
	}

	.toiletName {
		font-weight: 600;
		cursor: pointer;
	}

	.clickable {
		cursor: pointer;
	}

	:global(.curOwner) {
		font-size: 0.75em;
		color: var(--mf-dim);
		font-style: italic;
		font-weight: 400;
	}

	/* --- responsive podium (same breakpoints as before) --- */
	@media (max-width: 680px) {
		.label { padding: 4px 10px 5px; }
	}

	@media (max-width: 630px) {
		.label { font-size: 0.9em; }
		.awards { padding: 16px 10px 20px; }
		.seasonTitle { font-size: 1.7rem; }
	}

	@media (max-width: 610px) {
		#podium { width: 500px; height: 417px; }
		.firstLabel { bottom: 58%; }
		.secondLabel { bottom: 35%; }
		.thirdLabel { bottom: 31%; }
	}

	@media (max-width: 535px) {
		.label { font-size: 0.8em; }
	}

	@media (max-width: 520px) {
		.label { font-size: 0.72em; padding: 3px 6px 4px; }
		.divisions { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
		.teamName { font-size: 0.85em; }
	}

	@media (max-width: 510px) {
		#podium { width: 400px; height: 333px; }
	}

	@media (max-width: 425px) {
		.label { font-size: 0.62em; }
	}

	@media (max-width: 410px) {
		#podium { width: 300px; height: 250px; }
		.firstLabel { bottom: 53%; }
		.secondLabel { bottom: 31%; }
		.thirdLabel { bottom: 27%; }
	}

	@media (max-width: 329px) {
		.label { font-size: 0.52em; }
	}
</style>

<section class="awards">
	<div class="seasonHeader">
		<h3 class="seasonTitle">{year} Season</h3>
		<span class="seasonSub">Champion · <strong>{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, champion)}</strong></span>
	</div>

	<img src="/banner.png" class="banner" alt="The Champion's Cup" />

	<div id="podium">
		<img src="/podium.png" class="podiumImage" alt="" />

		<img src="{getAvatarFromTeamManagers(leagueTeamManagers, champion, year)}" class="first champ clickable" onclick={() => go(champion)} alt="champion" />
		<img src="/laurel.png" class="laurel" alt="" />
		<span class="label firstLabel clickable" role="link" tabindex="0" onclick={() => go(champion)} onkeydown={key(champion)}>
			<span class="place">Champion</span>
			{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, champion)}
		</span>

		<img src="{getAvatarFromTeamManagers(leagueTeamManagers, second, year)}" class="second champ clickable" onclick={() => go(second)} alt="2nd" />
		<span class="label secondLabel clickable" role="link" tabindex="0" onclick={() => go(second)} onkeydown={key(second)}>
			<span class="place">2nd</span>
			{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, second)}
		</span>

		<img src="{getAvatarFromTeamManagers(leagueTeamManagers, third, year)}" class="third champ clickable" onclick={() => go(third)} alt="3rd" />
		<span class="label thirdLabel clickable" role="link" tabindex="0" onclick={() => go(third)} onkeydown={key(third)}>
			<span class="place">3rd</span>
			{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, third)}
		</span>
	</div>

	{#if winners.length}
		<div class="sectionHead">{winners.some((d) => d.name) ? 'Division champions' : 'Regular season champion'}</div>
		<div class="divisions">
			{#each winners as division, i}
				<div class="division" role="link" tabindex="0" onclick={() => go(division.rosterID)} onkeydown={key(division.rosterID)}>
					{#if bannerFor(division, i)}
						<img class="divisionLogo" src={bannerFor(division, i)} alt="{division.name} division logo" />
						<span class="divisionName">{division.name}</span>
					{:else}
						<span class="divisionName">Regular season champion</span>
					{/if}
					<div class="leaderBlock">
						<img src="{getAvatarFromTeamManagers(leagueTeamManagers, division.rosterID, year)}" class="divisionLeader" alt="{division.name || 'Regular season'} champion" />
						<img src="/medal.png" class="medal" alt="" />
					</div>
					<span class="teamName">{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, division.rosterID)}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if toilet}
		<div class="sectionHead">Toilet bowl</div>
		<div class="toiletParent">
			<img src="/toilet-banner.png" class="toilet-banner" alt="The Toilet Bowl" />
			<div class="toiletBowl" role="link" tabindex="0" onclick={() => go(toilet)} onkeydown={key(toilet)}>
				<img src="{getAvatarFromTeamManagers(leagueTeamManagers, toilet, year)}" class="toiletWinner" alt="toilet bowl winner" />
				<img src="/toilet-bowl-2.png" class="toilet" alt="" />
			</div>
			<span class="toiletName" onclick={() => go(toilet)}>{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, toilet)}</span>
		</div>
	{/if}
</section>
