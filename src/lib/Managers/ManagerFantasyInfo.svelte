<script>
    export let viewManager, players, changeManager;

    // dynamic values (fall back to leagueInfo.js when unavailable)
    export let dynamicRival = null;
    export let topScorer = null;
    export let teamTier = null;
    export let historyState = 'loading';
    export let favoritePosition = null;

    $: assetPos = favoritePosition?.pos ?? viewManager.valuePosition;

    $: favoriteID = topScorer?.playerID ?? viewManager.favoritePlayer;
    $: favoriteInfo = favoriteID ? players?.[favoriteID] : null;

    $: mode = teamTier?.mode ?? viewManager.mode;

    $: rival = dynamicRival ?? (historyState === 'loading' ? null : viewManager.rival);
    $: rivalClickable = rival && rival.link != null;

    const formatPoints = (points) => Number(points).toFixed(1);
</script>

<style>
    .fantasyInfos {
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 0 0 2em;
        margin: 3em 0 4em;
        border-bottom: 1px solid var(--aaa);
        border-top: 1px solid var(--aaa);
        box-shadow: 0 0 8px 4px var(--ccc);
    }

    .infoSlot {
        text-align: center;
        margin: 2em 1em 0;
    }

    .infoIcon {
        display: inline-flex;
        height: 70px;
        width: 70px;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        border: 1px solid var(--ccc);
        overflow: hidden;
        background-color: var(--fff);
		transition: box-shadow 0.4s;
    }

    .playerIcon {
        align-items:flex-end;
    }

    .infoLabel {
        font-size: 0.7em;
        color: var(--blueOne);
        font-weight: 700;
        margin-bottom: 1em;
        height: 30px;
        width: 90px;
        text-align: center;
        line-height: 1.2em;
    }

    .infoAnswer {
        font-size: 0.8em;
        color: var(--g555);
        margin-top: 1em;
        width: 90px;
        text-align: center;
        line-height: 1.2em;
    }

    .infoDetail {
        margin-top: 0.35em;
        font-size: 0.85em;
        color: var(--mf-dim);
        font-style: italic;
    }

    .loadingIcon {
        animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.35; }
        50% { opacity: 1; }
    }

    .tradingScale {
        line-height: 70px;
        font-size: 55px;
        color: var(--blueOne);
    }

    .rookiesOrVets {
        height: 65px;
        vertical-align: middle;
    }

    .infoRival {
        cursor: pointer;
    }

    .infoRival:hover .infoIcon {
        box-shadow: 0 0 6px 4px var(--aaa);
        border: 1px solid var(--aaa);
    }

    .rival {
        height: 100%;
    }

    .rivalTier {
        color: var(--tierColor) !important;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .rebuildOrWin {
        height: 70px;
    }

    .valuePosition {
        line-height: 70px;
        font-size: 25px;
        color: var(--fff);
    }

    .QB {
        background-color: var(--QB);
    }

    .WR {
        background-color: var(--WR);
    }

    .RB {
        background-color: var(--RB);
    }

    .TE {
        background-color: var(--TE);
    }

    .Picks {
        background: #73b647;
    }
    .K {
        background-color: var(--K);
    }

    .DEF {
        background-color: var(--DEF);
    }

    .CB {
        background-color: #ffcc7a;
    }

    .SS {
        background-color: #b7a1db;
    }

    .FS {
        background-color: #ebe7b3;
    }

    .DE {
        background-color: #b1d0e9;
    }

    .DL {
        background-color: #c392d3;
    }

    .LB {
        background-color: #98c097;
    }

    .favoritePlayer {
        height: 65px;
        vertical-align: bottom;
    }

    /* media queries */

    @media (max-width: 731px) {
        .infoSlot {
            margin: 2em 3em 0;
        }
    }

    @media (max-width: 558px) {
        .infoSlot {
            margin: 2em 2em 0;
        }
    }

    @media (max-width: 461px) {
        .infoSlot {
            margin: 2em 1em 0;
        }
    }
</style>

<div class="fantasyInfos">
    <!-- Rookies or Vets (optional) -->
    {#if viewManager.rookieOrVets}
        <div class="infoSlot">
            <div class="infoLabel">
                Rookie or Vet Preference
            </div>
            <div class="infoIcon">
                <img class="rookiesOrVets" src="/{viewManager.rookieOrVets}.png" alt="rookie or vet preference"/>
            </div>
            <div class="infoAnswer">
                {viewManager.rookieOrVets}
            </div>
        </div>
    {/if}
    <!-- Favorite fantasy position (optional) -->
    {#if assetPos}
        <div class="infoSlot">
            <div class="infoLabel">
                Favorite Fantasy Asset
            </div>
            <div class="infoIcon {assetPos}">
                <span class="valuePosition">{assetPos}</span>
            </div>
            {#if favoritePosition}
                <div class="infoAnswer">
                    {favoritePosition.count} {favoritePosition.pos}{favoritePosition.count === 1 ? '' : 's'} rostered
                </div>
            {/if}
        </div>
    {/if}
    {#if viewManager.tradingScale}
        <!-- Trading Scale -->
        <div class="infoSlot">
            <div class="infoLabel">
                Desire to Trade
            </div>
            <div class="infoIcon">
                <span class="tradingScale">{viewManager.tradingScale}</span>
            </div>
            <div class="infoAnswer">
                {viewManager.tradingScale} out of 10
            </div>
        </div>
    {/if}
    <!-- Favorite player: this season's top scorer on the current roster -->
    {#if favoriteID && favoriteInfo}
        <div class="infoSlot">
            <div class="infoLabel">
                Favorite Player
            </div>
            <div class="infoIcon playerIcon">
                <img class="favoritePlayer" src="https://sleepercdn.com/content/nfl/players/{favoriteID}.jpg" alt="favorite player"/>
            </div>
            <div class="infoAnswer">
                {favoriteInfo.fn} {favoriteInfo.ln}
                {#if topScorer}
                    <div class="infoDetail">{formatPoints(topScorer.points)} pts this season</div>
                {/if}
            </div>
        </div>
    {/if}
    <!-- Win Now / Dynasty / Rebuild: league tier -->
    {#if mode}
        <div class="infoSlot">
            <div class="infoLabel">
                Win Now or Rebuild?
            </div>
            <div class="infoIcon">
                <img class="rebuildOrWin" src="/{mode.replace(' ', '%20')}.png" alt="win now or rebuild"/>
            </div>
            <div class="infoAnswer">
                {mode}
                {#if teamTier}
                    <div class="infoDetail">{teamTier.tier} · #{teamTier.rank} of {teamTier.total}</div>
                {/if}
            </div>
        </div>
    {/if}
    <!-- Rival: the current manager with the hottest rivalry (same tiers as the Rivalry pages) -->
    {#if rival}
        <div
            class="infoSlot"
            class:infoRival={rivalClickable}
            role={rivalClickable ? 'button' : undefined}
            tabindex={rivalClickable ? 0 : undefined}
            onclick={() => rivalClickable && changeManager(rival.link)}
            onkeydown={(e) => rivalClickable && (e.key === 'Enter' || e.key === ' ') && changeManager(rival.link)}
        >
            <div class="infoLabel">
                Rival
            </div>
            <div class="infoIcon">
                <img class="rival" src="{rival.image}" alt="rival"/>
            </div>
            <div class="infoAnswer">
                {rival.name}
                {#if dynamicRival}
                    {#if dynamicRival.tier}
                        <div class="infoDetail rivalTier" style="--tierColor: {dynamicRival.tier.color}">{dynamicRival.tier.name} · {dynamicRival.tier.score} pts</div>
                    {/if}
                    <div class="infoDetail">
                        {dynamicRival.yourWins}–{dynamicRival.theirWins}{dynamicRival.ties ? `–${dynamicRival.ties}` : ''} all time
                    </div>
                {/if}
            </div>
        </div>
    {:else if historyState === 'loading'}
        <div class="infoSlot">
            <div class="infoLabel">
                Rival
            </div>
            <div class="infoIcon loadingIcon"></div>
            <div class="infoAnswer">
                Finding rival…
            </div>
        </div>
    {/if}
</div>
