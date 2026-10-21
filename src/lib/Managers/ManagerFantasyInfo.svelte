<script>
    export let viewManager, players, changeManager;

    // dynamic values (fall back to leagueInfo.js when unavailable)
    export let dynamicRival = null;
    export let topScorer = null;
    export let teamTier = null;
    export let historyState = 'loading';
    export let favoritePosition = null;
    export let tradeDesire = null;
    export let ageTier = null;

    $: ageLabel = ageTier?.label ?? viewManager.rookieOrVets;
    $: tradeScore = tradeDesire?.score ?? viewManager.tradingScale;

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
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0;
        background: var(--mf-panel);
    }

    .infoSlot {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 10px 18px;
        text-align: center;
        background: var(--mf-panel);
        box-shadow: inset -1px -1px 0 var(--mf-line);
    }

    /* 16-sided icon: the outer shape is the glowing edge, ::before is the fill */
    .infoIcon {
        --fill: var(--mf-bg);
        position: relative;
        isolation: isolate;
        display: inline-flex;
        height: 74px;
        width: 74px;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        clip-path: polygon(59.8% 1.0%, 77.8% 8.4%, 91.6% 22.2%, 99.0% 40.2%, 99.0% 59.8%, 91.6% 77.8%, 77.8% 91.6%, 59.8% 99.0%, 40.2% 99.0%, 22.2% 91.6%, 8.4% 77.8%, 1.0% 59.8%, 1.0% 40.2%, 8.4% 22.2%, 22.2% 8.4%, 40.2% 1.0%);
        background: linear-gradient(160deg, var(--mf-ion), color-mix(in srgb, var(--mf-ion) 25%, transparent) 50%, var(--mf-ion));
        transition: filter 0.3s;
    }

    .infoIcon::before {
        content: '';
        position: absolute;
        inset: 2px;
        z-index: -1;
        clip-path: polygon(59.8% 1.0%, 77.8% 8.4%, 91.6% 22.2%, 99.0% 40.2%, 99.0% 59.8%, 91.6% 77.8%, 77.8% 91.6%, 59.8% 99.0%, 40.2% 99.0%, 22.2% 91.6%, 8.4% 77.8%, 1.0% 59.8%, 1.0% 40.2%, 8.4% 22.2%, 22.2% 8.4%, 40.2% 1.0%);
        background: var(--fill);
    }

    .playerIcon {
        align-items:flex-end;
    }

    .infoLabel {
        min-height: 2.4em;
        font-size: 0.66rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--mf-dim);
        font-weight: 700;
        margin-bottom: 0.8em;
        height: 30px;
        width: 90px;
        text-align: center;
        line-height: 1.2em;
    }

    .subAnswer {
        font-style: normal;
        color: var(--mf-dim);
        font-size: 0.9em;
    }

    .infoAnswer {
        font-size: 0.8em;
        color: var(--mf-text);
        margin-top: 0.9em;
        max-width: 140px;
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
        font-size: 42px;
        font-weight: 700;
        color: var(--mf-ion);
        text-shadow: 0 0 14px var(--mf-ion-glow);
    }

    .rookiesOrVets {
        height: 65px;
        vertical-align: middle;
    }

    .infoRival {
        cursor: pointer;
    }

    .infoRival:hover .infoIcon {
        filter: brightness(1.25) drop-shadow(0 0 6px var(--mf-ion-glow));
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
        --fill: var(--QB);
    }

    .WR {
        --fill: var(--WR);
    }

    .RB {
        --fill: var(--RB);
    }

    .TE {
        --fill: var(--TE);
    }

    .Picks {
        --fill: #73b647;
    }
    .K {
        --fill: var(--K);
    }

    .DEF {
        --fill: var(--DEF);
    }

    .CB {
        --fill: #ffcc7a;
    }

    .SS {
        --fill: #b7a1db;
    }

    .FS {
        --fill: #ebe7b3;
    }

    .DE {
        --fill: #b1d0e9;
    }

    .DL {
        --fill: #c392d3;
    }

    .LB {
        --fill: #98c097;
    }

    .favoritePlayer {
        height: 65px;
        vertical-align: bottom;
    }

    @media (max-width: 560px) {
        .fantasyInfos {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
</style>

<div class="fantasyInfos">
    <!-- Rookies or Vets (optional) -->
    {#if ageLabel}
        <div class="infoSlot">
            <div class="infoLabel">
                Rookie or Vet Preference
            </div>
            <div class="infoIcon">
                <img class="rookiesOrVets" src="/{ageLabel}.png" alt="rookie or vet preference"/>
            </div>
            <div class="infoAnswer">
                {ageLabel}{#if ageTier}<br /><span class="subAnswer">avg age {ageTier.avg.toFixed(1)}</span>{/if}
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
    {#if tradeScore}
        <!-- Trading Scale -->
        <div class="infoSlot">
            <div class="infoLabel">
                Desire to Trade
            </div>
            <div class="infoIcon">
                <span class="tradingScale">{tradeScore}</span>
            </div>
            <div class="infoAnswer">
                {tradeScore} out of 10{#if tradeDesire}<br /><span class="subAnswer">{tradeDesire.count} trade{tradeDesire.count === 1 ? '' : 's'} in {tradeDesire.year}</span>{/if}
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
