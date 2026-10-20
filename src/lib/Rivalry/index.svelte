<script>
	import Matchup from "$lib/Matchups/Matchup.svelte";
	import TradeTransaction from "$lib/Transactions/TradeTransaction.svelte";
	import { getLeagueRecords, getLeagueTransactions, getRivalryMatchups, loadPlayers, round } from "$lib/utils/helper";
	import { getRosterIDFromManagerIDAndYear, getTeamNameFromTeamManagers } from "$lib/utils/helperFunctions/universalFunctions";
	import LinearProgress from '@smui/linear-progress';
	import { onMount } from "svelte";
	import ComparissonBar from "./ComparissonBar.svelte";
	import ManagerSelectors from "./ManagerSelectors.svelte";
	import RivalryControls from "./RivalryControls.svelte";

	export let leagueTeamManagers, playersInfo, transactionsInfo, recordsInfo, playerOne, playerTwo;

    // refresh stale data
    onMount(async () => {
        if(transactionsInfo.stale) {
            transactionsInfo = await getLeagueTransactions(false, true);
        }
        if(playersInfo.stale) {
            playersInfo = await loadPlayers(null, true);
        }
        if(recordsInfo.stale) {
            recordsInfo = await getLeagueRecords(true);
        }
    })

    let rivalry = null;
    let loading = true;

    const analyzeRivalry = async (p1, p2) => {
        loading = true;
        matchup = null;
        if(p1 && p2) {
            rivalry = await getRivalryMatchups(p1, p2);
            loading = false;
        }
    }

    $: analyzeRivalry(playerOne, playerTwo);

    let selected = 0;

    $: matchup = rivalry?.matchups[selected]?.matchup;
    $: displayWeek = rivalry?.matchups[selected]?.week;
    $: displayLabel = rivalry?.matchups[selected]?.label;

    const teamName = (rosterID, season) => {
        try {
            return getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, season);
        } catch {
            return 'Unknown Team';
        }
    };

    const recordText = (a, b, t = 0) => `${a}–${b}${t ? `–${t}` : ''}`;
    $: year = rivalry?.matchups[selected]?.year;
    
    const setTradeHistory = (p1, p2) => {
        if(!p1 || !p2) {
            return [];
        }
        const trades = transactionsInfo.transactions.filter( transaction => {
            if(transaction.type !== "trade") {
                return false;
            }
            const rosterIDOne = parseInt(getRosterIDFromManagerIDAndYear(leagueTeamManagers, playerOne, transaction.season));
            const rosterIDTwo = parseInt(getRosterIDFromManagerIDAndYear(leagueTeamManagers, playerTwo, transaction.season));
            if(rosterIDOne == rosterIDTwo) {
                return false;
            }
            return transaction.rosters.includes(rosterIDOne) && transaction.rosters.includes(rosterIDTwo);
        });
        const move = (arr, from, to) => {
            arr.splice(to, 0, arr.splice(from, 1)[0]);
        };
        // reorganize trades so that they match the left-right alignment of the rivalry page
        return trades.map(t => {
            const rosterIDOne = parseInt(getRosterIDFromManagerIDAndYear(leagueTeamManagers, playerOne, t.season));
            const rosterIDTwo = parseInt(getRosterIDFromManagerIDAndYear(leagueTeamManagers, playerTwo, t.season));
            const rosterOneStartLocation = t.rosters.indexOf(rosterIDOne);
            if(rosterOneStartLocation > 0) {
                move(t.rosters, rosterOneStartLocation, 0);
                for(const tradeMove of t.moves) {
                    move(tradeMove, rosterOneStartLocation, 0);
                }
            }
            const rosterTwoStartLocation = t.rosters.indexOf(rosterIDTwo);
            const last = t.rosters.length - 1;
            if(rosterTwoStartLocation < last) {
                move(t.rosters, rosterTwoStartLocation, last);
                for(const tradeMove of t.moves) {
                    move(tradeMove, rosterTwoStartLocation, last);
                }
            }
            return t;
        })
    }

    $: tradeHistory = setTradeHistory(playerOne, playerTwo);

    const performanceOrderOne = [
        {field: "wins", label: "Wins", unit: "wins"},
        {field: "losses", label: "Losses", unit: "losses"},
        {field: "ties", label: "Ties", unit: "ties"},
    ]

    const performanceOrderTwo = [
        {field: "fptsFor", label: "Fantasy Points For", unit: "fpts"},
        {field: "fptsAgainst", label: "Fantasy Points Against", unit: "fpts against"},
    ]

    $: playerOneRecords = recordsInfo?.regularSeasonData?.leagueManagerRecords ? recordsInfo.regularSeasonData.leagueManagerRecords[playerOne] : null;
    $: playerTwoRecords = recordsInfo?.regularSeasonData?.leagueManagerRecords ? recordsInfo.regularSeasonData.leagueManagerRecords[playerTwo] : null;
</script>

<style>
    .scoreBoard {
        width: 97%;
        border-radius: 20px;
        background-color: var(--rivalryBack);
        border: 1px solid var(--mf-line);
        box-shadow: 0 0 26px -14px var(--mf-ion-glow);
        margin: 2em auto;
        padding: 2em 0;
        max-width: 1000px;
    }
    h2 {
        text-align: center;
        font-size: 2.4em;
        margin: 1.3em 0 0;
    }
    h3 {
        text-align: center;
        font-size: 1.9em;
        margin: 20px 0 16px;
    }
    .trades {
        width: 95%;
        max-width: 750px;
        margin: 2em auto;
    }
	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}
    .center {
        text-align: center;
    }

    /* rivalry tier */
    .tierBanner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        margin: 0 auto 1.5em;
        padding: 14px 20px 12px;
        width: fit-content;
        max-width: 90%;
        border-radius: 14px;
        border: 2px solid var(--tierColor);
        box-shadow: 0 0 26px -6px var(--tierColor);
        background: color-mix(in srgb, var(--tierColor) 12%, transparent);
        text-align: center;
    }

    .tierLabel {
        font-size: 0.75em;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--mf-dim);
    }

    .tierName {
        font-size: 1.7em;
        font-weight: 900;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--tierColor);
    }

    .tierFlames {
        font-size: 1.1em;
        letter-spacing: 2px;
    }

    .tierFlames .dim {
        filter: grayscale(1);
        opacity: 0.25;
    }

    .tierReason {
        font-size: 0.9em;
        color: var(--mf-dim);
    }

    /* regular season vs playoffs */
    .splits {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        width: 90%;
        max-width: 560px;
        margin: 0 auto 1.5em;
    }

    .split {
        padding: 10px 8px;
        border-radius: 10px;
        border: 1px solid var(--aaa);
        text-align: center;
    }

    .splitTitle {
        font-size: 0.75em;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--mf-dim);
    }

    .splitRecord {
        font-size: 1.9em;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
    }

    .splitNote {
        font-size: 0.75em;
        color: var(--mf-dim);
    }

    .meetings {
        width: 90%;
        max-width: 560px;
        margin: 0 auto 1.5em;
        padding: 0;
        list-style: none;
    }

    .meeting {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-bottom: 1px solid var(--mf-line);
        font-size: 0.95em;
    }

    .meetingStage {
        flex: none;
        min-width: 9.5em;
        font-weight: 800;
    }

    .meetingStage.championship {
        color: #e5b52a;
    }

    .meetingResult {
        flex: 1;
        min-width: 0;
    }

    .meetingScore {
        flex: none;
        font-variant-numeric: tabular-nums;
        color: var(--mf-dim);
    }

    @media (max-width: 520px) {
        .meeting {
            flex-wrap: wrap;
            gap: 2px 10px;
        }
        .meetingStage {
            min-width: 0;
        }
    }
    .helmets {
        width: 80%;
        max-width: 800px;
        margin: 0 auto 2em;
    }
    @media (max-width: 650px) {
        h3 {
            font-size: 1.6em;
        }
    }
    @media (max-width: 400px) {
        h2 {
            font-size: 2em;
        }
        h3 {
            font-size: 1.3em;
        }
    }
</style>

<h2>Rivalry</h2>

<div class="rivalrySelection">
    <ManagerSelectors bind:playerOne={playerOne} bind:playerTwo={playerTwo} {leagueTeamManagers} />
</div>

{#if loading }
    {#if playerOne && playerTwo }
        <div class="loading">
            <p>Analyzing rivalry...</p>
            <br />
            <LinearProgress indeterminate />
        </div>
    {:else}
        <div class="center">
            <img class="helmets" src="/helmets.png" alt="placeholder of helmets clashing" />
        </div>
    {/if}
{:else}
    {#if rivalry?.matchups.length > 0 }
        <div class="scoreBoard">
            {#if rivalry.tier}
                <div class="tierBanner" style="--tierColor: {rivalry.tier.color}">
                    <span class="tierLabel">Rivalry Tier {rivalry.tier.tier}</span>
                    <span class="tierName">{rivalry.tier.name}</span>
                    <span class="tierFlames" aria-hidden="true">
                        {#each [1, 2, 3, 4, 5] as n}
                            <span class:dim={n > rivalry.tier.flames}>🔥</span>
                        {/each}
                    </span>
                    <span class="tierReason">{rivalry.tier.reason}</span>
                </div>
            {/if}
            <h3>Head to Head</h3>
            <div class="splits">
                <div class="split">
                    <div class="splitTitle">Regular Season</div>
                    <div class="splitRecord">{recordText(rivalry.regular.one, rivalry.regular.two, rivalry.regular.ties)}</div>
                    <div class="splitNote">left – right</div>
                </div>
                <div class="split">
                    <div class="splitTitle">Playoffs</div>
                    <div class="splitRecord">{recordText(rivalry.playoffs.one, rivalry.playoffs.two)}</div>
                    <div class="splitNote">{rivalry.playoffMeetings.length ? `${rivalry.playoffMeetings.length} meeting${rivalry.playoffMeetings.length > 1 ? 's' : ''}` : 'never met'}</div>
                </div>
            </div>
            {#if rivalry.playoffMeetings.length}
                <ul class="meetings">
                    {#each rivalry.playoffMeetings as meeting}
                        <li class="meeting">
                            <span class="meetingStage" class:championship={meeting.stage === 'championship'}>
                                {meeting.year} {meeting.label}
                            </span>
                            <span class="meetingResult">
                                {teamName(meeting.winnerRosterID, meeting.year)} won
                            </span>
                            {#if meeting.pointsOne != null}
                                <span class="meetingScore">
                                    {round(meeting.winnerSide === 'one' ? meeting.pointsOne : meeting.pointsTwo)}–{round(meeting.winnerSide === 'one' ? meeting.pointsTwo : meeting.pointsOne)}
                                </span>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {/if}
            <!-- wins -->
            <ComparissonBar sideOne={rivalry.wins.one} sideTwo={rivalry.wins.two} label="Wins" unit="wins" />
            <!-- points -->
            <ComparissonBar sideOne={parseFloat(round(rivalry.points.one))} sideTwo={parseFloat(round(rivalry.points.two))} label="Points" unit="pts" />
            <h3>Matchups</h3>
            <RivalryControls bind:selected={selected} {year} {displayWeek} {displayLabel} length={rivalry.matchups.length} />
            <Matchup key={`${playerOne}-${playerTwo}`} ix={selected} active={selected} {year} {matchup} players={playersInfo.players} {displayWeek} expandOverride={true} {leagueTeamManagers} />
        </div>
    {/if}
    <div class="scoreBoard">
        {#if playerOne && playerTwo }
            <!-- trades -->
            <h3>Trade History</h3>
            <div class="trades">
                {#each tradeHistory as transaction }
                    <TradeTransaction players={playersInfo.players} {transaction} {leagueTeamManagers} />
                {:else}
                    No trades yet...
                {/each}
            </div>
        {/if}
    </div>
    {#if playerOne && playerTwo && playerOneRecords && playerTwoRecords }
        <div class="scoreBoard">
            <!-- record comparisson -->
            <h3>Performance Comparisson</h3>
            <ComparissonBar
                sideOne={parseFloat(round(
                    playerOneRecords.wins/(playerOneRecords.wins + playerOneRecords.ties + playerOneRecords.losses) * 100
                    ))}
                sideTwo={parseFloat(round(
                    playerTwoRecords.wins/(playerTwoRecords.wins + playerTwoRecords.ties + playerTwoRecords.losses) * 100
                    ))}
                label="Win Percentage"
                unit="%"
            />
            {#each performanceOrderOne as stat }
                <ComparissonBar
                    sideOne={parseFloat(round(playerOneRecords[stat.field]))}
                    sideTwo={parseFloat(round(playerTwoRecords[stat.field]))}
                    label={stat.label}
                    unit={stat.unit}
                />
            {/each}
            <ComparissonBar
                sideOne={parseFloat(round(
                    playerOneRecords.fptsFor/(playerOneRecords.wins + playerOneRecords.ties + playerOneRecords.losses)
                    ))}
                sideTwo={parseFloat(round(
                    playerTwoRecords.fptsFor/(playerTwoRecords.wins + playerTwoRecords.ties + playerTwoRecords.losses)
                    ))}
                label="Fantasy Points per Game"
                unit="fpts/game"
            />
            {#each performanceOrderTwo as stat }
                <ComparissonBar
                    sideOne={parseFloat(round(playerOneRecords[stat.field]))}
                    sideTwo={parseFloat(round(playerTwoRecords[stat.field]))}
                    label={stat.label}
                    unit={stat.unit}
                />
            {/each}
            <ComparissonBar
                sideOne={parseFloat(round(
                    playerOneRecords.fptsFor/playerOneRecords.potentialPoints * 100
                    ))}
                sideTwo={parseFloat(round(
                    playerTwoRecords.fptsFor/playerTwoRecords.potentialPoints * 100
                    ))}
                label="Lineup IQ"
                unit="%"
            />
        </div>
    {/if}
{/if}
