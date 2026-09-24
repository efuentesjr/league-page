<script>
    import {round} from '$lib/utils/helper'
    import { calculateManagerLineupIQ } from '$lib/utils/managerLineupIQ';
    import RecordsAndRankings from './RecordsAndRankings.svelte';

    export let key, leagueManagerRecords, leagueTeamManagers, leagueWeekHighs, leagueWeekLows, allTimeBiggestBlowouts, allTimeClosestMatchups, mostSeasonLongPoints, leastSeasonLongPoints, transactionTotals;

    let winPercentages = [];
    let lineupIQs = [];
    let fptsHistories = [];
    let tradesData = [];
    let waiversData = [];

    let showTies = false;
    
    for(const managerID in transactionTotals.allTime) {
        tradesData.push({
            managerID,
            trades: transactionTotals.allTime[managerID].trade,
        })
        waiversData.push({
            managerID,
            waivers: transactionTotals.allTime[managerID].waiver,
        })
    }


    const setRankingsData = (lRR) => {
        winPercentages = [];
        lineupIQs = [];
        fptsHistories = [];
        tradesData = [];
        waiversData = [];
        showTies = false;

        /*
         * ---------------------------------------------------------
         * WIN PERCENTAGES
         * ---------------------------------------------------------
         */
        for(const managerID in lRR) {
            const leagueManagerRecord = lRR[managerID];

            const denominator =
                (leagueManagerRecord.wins +
                leagueManagerRecord.ties +
                leagueManagerRecord.losses) > 0
                    ? (
                        leagueManagerRecord.wins +
                        leagueManagerRecord.ties +
                        leagueManagerRecord.losses
                    )
                    : 1;

            winPercentages.push({
                managerID,
                percentage: round(
                    (
                        leagueManagerRecord.wins +
                        leagueManagerRecord.ties / 2
                    ) / denominator * 100
                ),
                wins: leagueManagerRecord.wins,
                ties: leagueManagerRecord.ties,
                losses: leagueManagerRecord.losses,
            });


            /*
             * -----------------------------------------------------
             * FANTASY POINTS HISTORY
             * -----------------------------------------------------
             */
            fptsHistories.push({
                managerID,
                fptsFor: round(leagueManagerRecord.fptsFor),
                fptsAgainst: round(leagueManagerRecord.fptsAgainst),
                fptsPerGame: round(
                    leagueManagerRecord.fptsFor / denominator
                ),
            });

            if(leagueManagerRecord.ties > 0) {
                showTies = true;
            }
        }


        /*
         * ---------------------------------------------------------
         * MANAGER LINEUP IQ
         * ---------------------------------------------------------
         *
         * New calculation:
         *
         *   70% = Lineup Efficiency
         *   30% = Roster Strength
         *
         * Lineup Efficiency:
         *   Actual Points / Potential Points
         *
         * Potential PPG:
         *   Potential Points / Games
         *
         * Roster Strength:
         *   Manager Potential PPG / League Median Potential PPG
         *
         * Adjustment Factor:
         *   0.70 + (0.30 × Roster Strength)
         *
         * Manager IQ:
         *   Lineup Efficiency × Adjustment Factor
         *
         * The calculation itself lives in:
         *
         *   src/lib/utils/managerLineupIQ.js
         *
         * This keeps the formula separate from the Records
         * component and makes it easier to modify later.
         * ---------------------------------------------------------
         */
        lineupIQs = calculateManagerLineupIQ(lRR);


        /*
         * ---------------------------------------------------------
         * TRANSACTIONS
         * ---------------------------------------------------------
         */
        for(const managerID in transactionTotals.allTime) {
            tradesData.push({
                managerID,
                trades: transactionTotals.allTime[managerID].trade,
            });

            waiversData.push({
                managerID,
                waivers: transactionTotals.allTime[managerID].waiver,
            });
        }


        /*
         * ---------------------------------------------------------
         * SORT RANKINGS
         * ---------------------------------------------------------
         */
        winPercentages.sort((a, b) => b.percentage - a.percentage);

        lineupIQs.sort((a, b) => b.iq - a.iq);

        fptsHistories.sort((a, b) => b.fptsFor - a.fptsFor);

        tradesData.sort((a, b) => b.trades - a.trades);

        waiversData.sort((a, b) => b.waivers - a.waivers);
    }

    $:setRankingsData(leagueManagerRecords)
</script>

<RecordsAndRankings
    blowouts={allTimeBiggestBlowouts}
    closestMatchups={allTimeClosestMatchups}
    weekRecords={leagueWeekHighs}
    weekLows={leagueWeekLows}
    seasonLongRecords={mostSeasonLongPoints}
    seasonLongLows={leastSeasonLongPoints}
    {showTies}
    {winPercentages}
    {fptsHistories}
    {lineupIQs}
    {tradesData}
    {waiversData}
    prefix="All-Time"
    allTime={true}
    {leagueTeamManagers}
    {key}
/>
