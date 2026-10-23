<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import Button, { Group, Label } from '@smui/button';
    import BracketsColumn from "./BracketsColumn.svelte";
    import Matchup from "./Matchup.svelte";
    import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import { LOTTERY } from '$lib/utils/helperFunctions/playoffOdds';

    export let leagueTeamManagers, players, brackets, selection, queryWeek;
    export let syncUrl = true; // false when shown outside the Matchups page

    const {playoffsStart, champs, losers, numRosters} = brackets;

    const champsBracket = champs.bracket;
    const champsConsolations = champs.consolations;

    const losersBracket = losers.bracket;
    const losersConsolations = losers.consolations;

    let bracket = [];
    let consolations = [];
    let allMatches = [];

    let el, top;

    onMount(() => {
        if(!syncUrl) return;
        if(queryWeek && queryWeek > 0 && queryWeek < playoffsStart) {
            goto(`/matchups?week=1`, {noscroll: true});
            selection = 'regular';
        } else {
            goto(`/matchups?week=${playoffsStart}`, {noscroll: true});
        }
    })

    const changeSelection = () => {
        if(selection == 'losers') {
            bracket = losersBracket;
            consolations = losersConsolations;
        } else {
            bracket = champsBracket;
            consolations = champsConsolations;
        }
        allMatches = []
        for(const week of bracket) {
            allMatches = [...allMatches, ...week]
        }
        for(const consolation of consolations) {
            for(const week of consolation) {
                allMatches = [...allMatches, ...week]
            }
        }
        top = el?.getBoundingClientRect()?.top || 0;
        setSelected(selection);
    }

    $: changeSelection(selection);

    let selected;

    const setSelected = (s) => {
        selected = bracket[0]?.filter(mp => !mp.bye)[0][0].m || null;
    }

    let matchup, displayWeek;
    const changeDisplay = (s) => {
        top = el?.getBoundingClientRect()?.top || 0;
        matchup = allMatches.filter(match => match[0].m == s)[0];
        displayWeek = playoffsStart + matchup[0].r - 1;
        window.scrollTo({left: 0, top, behavior: 'smooth'});
    }

    let matchupWeek = 1;

    /* ---------- champions + ping pong balls ---------- */
    const finalOf = (b) => (b?.[b.length - 1] || []).find((mp) => mp?.[0]?.m && !mp.bye) || null;
    $: finalMatch = finalOf(bracket);
    $: winnerID = finalMatch?.[0]?.w ?? null;
    $: isLosers = selection == 'losers';

    // Toilet Bowl finish: champion, runner-up, and the 3rd-place game winner
    $: toiletFinish = (() => {
        const out = {};
        const fin = finalOf(losersBracket);
        if (fin?.[0]?.w) {
            out[String(fin[0].w)] = 1;
            if (fin[0].l) out[String(fin[0].l)] = 2;
        }
        const third = finalOf(losersConsolations?.[0]);
        if (third?.[0]?.w) out[String(third[0].w)] = 3;
        return out;
    })();

    $: balls = (() => {
        const out = {};
        for (const [rid, finish] of Object.entries(toiletFinish)) {
            const n = LOTTERY.toiletBowl[finish - 1] || 0;
            if (!n) continue;
            const e = (out[rid] ??= { n: 0, why: [] });
            e.n += n;
            e.why.push(`${n} for Toilet Bowl ${finish === 1 ? 'champion' : finish === 2 ? 'runner-up' : '3rd place'}`);
        }
        return out;
    })();

    const changeMatchupGame = (week) => {
        matchupWeek = week;
    }

    $: changeDisplay(selected);
</script>

<style>
    .brackets {
        width: 96%;
        max-width: 1250px;
        margin: 1.5em auto 4em;
        padding: 10px 0 20px;
        background:
            linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
            linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
            radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-ion) 10%, transparent), transparent 60%),
            var(--mf-bg);
        border: 1px solid var(--mf-line);
        border-top: 2px solid var(--mf-ion);
        clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
    }

    .bracket {
        margin: 1em 0;
        padding-top: 0.6em;
        display: flex;
        justify-content: center;
    }

    @media (max-width: 610px) {
        .brackets {
            width: 100%;
            clip-path: none;
            border-left: 0;
            border-right: 0;
        }
        .bracket {
            padding-top: 0.8em;
        }
    }

    /* ---------- champion box ---------- */
    .champCol {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 200px;
        padding: 40px 10px 0;
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    }

    .champLabel {
        position: absolute;
        top: 0;
        margin: 0;
        padding: 3px 12px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #1a1203;
        background: linear-gradient(180deg, #fff3c4, #f5d56b 60%, #c9962c);
        box-shadow: 0 0 18px -4px rgba(245, 213, 107, 0.7);
    }

    .champLabel.toilet {
        color: #d9a62e;
        background: var(--mf-panel);
        border: 1px solid color-mix(in srgb, #d9a62e 50%, var(--mf-line));
        box-shadow: none;
    }

    .champCard {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 16px 10px;
        text-align: center;
        background:
            radial-gradient(ellipse at 50% 0%, rgba(245, 213, 107, 0.22), transparent 70%),
            var(--mf-panel);
        border: 1px solid color-mix(in srgb, #f5d56b 50%, transparent);
        border-top: 3px solid #f5d56b;
        clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    }

    /* connector from the final */
    .champCol::before {
        content: '';
        position: absolute;
        left: -1em;
        top: calc(50% + 20px);
        width: calc(1em + 10px);
        height: 2px;
        background: #f5d56b;
        box-shadow: 0 0 6px rgba(245, 213, 107, 0.6);
    }

    .champCard.toilet {
        border-color: color-mix(in srgb, #d9a62e 45%, transparent);
        border-top-color: #d9a62e;
        background:
            radial-gradient(ellipse at 50% 0%, rgba(217, 166, 46, 0.14), transparent 70%),
            var(--mf-panel);
    }

    .champCard.crowned {
        box-shadow: inset 0 0 40px -12px rgba(255, 215, 0, 0.7);
        animation: crown 2.6s ease-in-out infinite;
    }

    @keyframes crown {
        0%, 100% { filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.3)); }
        50% { filter: drop-shadow(0 0 14px rgba(255, 215, 0, 0.8)); }
    }

    .champHex {
        position: relative;
        width: 56px;
        height: 64px;
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        background: linear-gradient(150deg, #fff3c4, #f5d56b 30%, #a7781d 60%, #f5d56b);
    }

    .champHex img {
        position: absolute;
        inset: 3px;
        width: calc(100% - 6px);
        height: calc(100% - 6px);
        object-fit: cover;
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        background: #050a16;
    }

    .champAvatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #f5d56b;
    }

    .champName {
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1.2;
        background: linear-gradient(180deg, #fff6d0, #f5d56b 55%, #c9962c);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    .champName.tbd {
        font-style: italic;
        background: none;
        color: var(--mf-dim);
    }

    .champSub,
    .champBalls {
        font-size: 0.7rem;
        color: var(--mf-dim);
    }

    .champBalls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #ffd400;
    }

    .champBalls span {
        margin-left: 4px;
    }

    .ballKey {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin: 0 16px 8px;
        font-family: 'Roboto', sans-serif;
        font-size: 0.76rem;
        color: var(--mf-dim);
    }

    .ballDot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #fff7b0, #ffd400 45%, #c79a00);
        box-shadow: 0 0 6px rgba(255, 212, 0, 0.7);
    }

    @media (max-width: 610px) {
        /* phones: the champion box sits under the bracket, full width */
        .bracket {
            flex-wrap: wrap;
        }
        .champCol {
            flex: 0 0 100%;
            width: 100%;
            margin-top: 10px;
            padding: 38px 0 0;
        }
        .champCol::before {
            display: none;
        }
        .champCard {
            max-width: 240px;
            flex-direction: row;
            justify-content: center;
            flex-wrap: wrap;
            padding: 12px;
        }
        .champHex {
            width: 40px;
            height: 46px;
        }
        .champSub,
        .champBalls {
            flex-basis: 100%;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .champCard.crowned {
            animation: none;
        }
    }

    .bracket + .bracket {
        margin-top: 0.5em;
        border-top: 1px dashed var(--mf-line);
    }

    .matchupEnclosure {
        padding: 2em 0;
        margin-bottom: 2em;
    }

    .buttonHolder {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 3em 0;
    }
</style>

<div class="brackets">
    <div class="bracket">
        {#each bracket as matchCol, ix}
            <BracketsColumn bind:selected={selected} {leagueTeamManagers} {matchCol} {ix} {players} {playoffsStart} playoffLength={bracket.length} losers={selection == 'losers'} {balls} />
        {/each}
        {#if finalMatch}
            <div class="champCol">
                <p class="champLabel" class:toilet={isLosers}>{isLosers ? 'Toilet Bowl Champ' : 'Champion'}</p>
                <div class="champCard" class:toilet={isLosers} class:crowned={winnerID}>
                    <div class="champHex">
                        <img src={isLosers ? '/awards/toilet.png' : '/awards/champion.png'} alt="" />
                    </div>
                    {#if winnerID}
                        <img class="champAvatar" src={getAvatarFromTeamManagers(leagueTeamManagers, winnerID, leagueTeamManagers.currentYear)} alt="" />
                        <div class="champName">{getTeamNameFromTeamManagers(leagueTeamManagers, winnerID, leagueTeamManagers.currentYear)}</div>
                    {:else}
                        <div class="champName tbd">TBD</div>
                    {/if}
                    {#if isLosers}
                        <div class="champBalls" title="{LOTTERY.toiletBowl[0]} ping pong balls">
                            {#each Array(LOTTERY.toiletBowl[0]) as _}<i class="ballDot"></i>{/each}
                            <span>{winnerID ? 'earned' : 'to the winner'}</span>
                        </div>
                    {:else if !winnerID}
                        <div class="champSub">Decided in the Championship Match</div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
    {#if isLosers}
        <p class="ballKey">
            <span class="ballDot"></span>
            Toilet Bowl ping pong balls (Constitution 3.4): champion {LOTTERY.toiletBowl[0]}, runner-up {LOTTERY.toiletBowl[1]}, 3rd place {LOTTERY.toiletBowl[2]}.
            They show next to each team once those games are final.
        </p>
    {/if}

    {#each consolations as consolation, consolationNum}
        <div class="bracket">
            {#each consolation as matchCol, ix}
                <BracketsColumn bind:selected={selected} {leagueTeamManagers} {consolationNum} {matchCol} {ix} {players} {playoffsStart} playoffLength={consolation.length} {numRosters} consolation={true} losers={selection == 'losers'} {balls} />
            {/each}
        </div>
    {/each}
</div>

<div class="matchupEnclosure" bind:this={el}>
    {#if matchup}
        {#if matchup[0].starters[2] }
            <div class="buttonHolder">
                <Group variant="outlined">
                    <!-- Regular Season -->
                    <Button class="selectionButtons" onclick={() => changeMatchupGame(1)} variant="{matchupWeek == 1 ? "raised" : "outlined"}">
                        <Label>First Week</Label>
                    </Button>
                    <!-- Championship Bracket -->
                    <Button class="selectionButtons" onclick={() => changeMatchupGame(2)} variant="{matchupWeek == 2 ? "raised" : "outlined"}">
                        <Label>Second Week</Label>
                    </Button>
                </Group>
            </div>
        {/if}
        <Matchup ix={selected} active={selected} {matchup} {matchupWeek} {players} {displayWeek} expandOverride={true} {leagueTeamManagers} />
    {/if}
</div>
