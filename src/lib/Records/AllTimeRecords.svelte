<script>
    import { round } from '$lib/utils/helper';
    import RecordsAndRankings from './RecordsAndRankings.svelte';

    export let key, leagueManagerRecords, leagueTeamManagers, leagueWeekHighs, leagueWeekLows, allTimeBiggestBlowouts, allTimeClosestMatchups, mostSeasonLongPoints, leastSeasonLongPoints, transactionTotals;

    let winPercentages = [];
    let lineupIQs = [];
    let fptsHistories = [];
    let tradesData = [];
    let waiversData = [];
    let showTies = false;

    // Deduplicate and populate data in setRankingsData
    const setRankingsData = (lRR) => {
        // Deduplicate leagueManagerRecords by managerID
        const uniqueLeagueManagerRecords = Object.fromEntries(
            Object.entries(leagueManagerRecords).filter(([key, value], index, self) =>
                index === self.findIndex(([k]) => k === key)
            )
        );

        // Deduplicate transactionTotals.allTime by managerID
        const uniqueTransactionTotals = {
            allTime: Object.fromEntries(
                Object.entries(transactionTotals.allTime).filter(([managerID], index, self) =>
                    index === self.findIndex(([id]) => id === managerID)
                )
            )
        };

        console.log('Deduplicated leagueManagerRecords:', uniqueLeagueManagerRecords);
        console.log('Deduplicated transactionTotals.allTime:', uniqueTransactionTotals.allTime);

        // Initialize arrays to store calculated data
        winPercentages = [];
        lineupIQs = [];
        fptsHistories = [];
        tradesData = [];
        waiversData = [];
        showTies = false;

        // Calculate win percentages and populate lineupIQs, fptsHistories
        for (const key in uniqueLeagueManagerRecords) {
            const leagueManagerRecord = uniqueLeagueManagerRecords[key];
            const denominator = (leagueManagerRecord.wins + leagueManagerRecord.ties + leagueManagerRecord.losses) > 0
                ? (leagueManagerRecord.wins + leagueManagerRecord.ties + leagueManagerRecord.losses)
                : 1;

            winPercentages.push({
                managerID: key,
                percentage: round((leagueManagerRecord.wins + leagueManagerRecord.ties / 2) / denominator * 100),
                wins: leagueManagerRecord.wins,
                ties: leagueManagerRecord.ties,
                losses: leagueManagerRecord.losses,
            });

            let lineupIQ = {
                managerID: key,
                fpts: round(leagueManagerRecord.fptsFor),
            };

            if (leagueManagerRecord.potentialPoints) {
                lineupIQ.iq = round((leagueManagerRecord.fptsFor / leagueManagerRecord.potentialPoints) * 100);
                lineupIQ.potentialPoints = round(leagueManagerRecord.potentialPoints);
            }

            lineupIQs.push(lineupIQ);

            fptsHistories.push({
                managerID: key,
                fptsFor: round(leagueManagerRecord.fptsFor),
                fptsAgainst: round(leagueManagerRecord.fptsAgainst),
                fptsPerGame: round(leagueManagerRecord.fptsFor / denominator),
            });

            if (leagueManagerRecord.ties > 0) showTies = true;
        }

        // Populate tradesData and waiversData
        for (const managerID in uniqueTransactionTotals.allTime) {
            tradesData.push({
                managerID,
                trades: uniqueTransactionTotals.allTime[managerID].trade,
            });
            waiversData.push({
                managerID,
                waivers: uniqueTransactionTotals.allTime[managerID].waiver,
            });
        }

        // Sort the arrays for display
        winPercentages.sort((a, b) => b.percentage - a.percentage);
        lineupIQs.sort((a, b) => b.iq - a.iq);
        fptsHistories.sort((a, b) => b.fptsFor - a.fptsFor);
        tradesData.sort((a, b) => b.trades - a.trades);
        waiversData.sort((a, b) => b.waivers - a.waivers);
    }

    // Run setRankingsData reactively
    $: setRankingsData(leagueManagerRecords);
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


