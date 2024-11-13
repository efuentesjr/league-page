<script>
    import {round} from '$lib/utils/helper'
    import RecordsAndRankings from './RecordsAndRankings.svelte'

    export let key, leagueManagerRecords, leagueTeamManagers, leagueWeekHighs, leagueWeekLows, allTimeBiggestBlowouts, allTimeClosestMatchups, mostSeasonLongPoints, leastSeasonLongPoints, transactionTotals

    let winPercentages = []
    let lineupIQs = []
    let fptsHistories = []
    let tradesData = []
    let waiversData = []

    let showTies = false

const setRankingsData = (lRR) => {
    winPercentages = []
    lineupIQs = []
    fptsHistories = []
    tradesData = []
    waiversData = []
    showTies = false

    for (const key in lRR) {
        const leagueManagerRecord = lRR[key]
        
        // Original values for accurate All-Time Win Percentage Rankings
        const originalWins = leagueManagerRecord.wins
        const originalTies = leagueManagerRecord.ties
        const originalLosses = leagueManagerRecord.losses
        const denominator = (originalWins + originalTies + originalLosses) > 0
            ? (originalWins + originalTies + originalLosses)
            : 1

        // Calculate accurate win percentage with original values
        winPercentages.push({
            managerID: key,
            percentage: round((originalWins + originalTies / 2) / denominator * 100), // Use original values
            wins: originalWins / 2,  // Adjusted for display in playoffs
            ties: originalTies / 2,  // Adjusted for display in playoffs
            losses: originalLosses / 2 // Adjusted for display in playoffs
        })

        // Use adjusted values only for display if duplicated, but use original for calculations
        let lineupIQ = {
            managerID: key,
            fpts: round(leagueManagerRecord.fptsFor / 2)  // Display adjusted
        }

        if (leagueManagerRecord.potentialPoints) {
            lineupIQ.iq = round((leagueManagerRecord.fptsFor / leagueManagerRecord.potentialPoints) * 100)  // Original values for accuracy
            lineupIQ.potentialPoints = round(leagueManagerRecord.potentialPoints / 2)  // Display adjusted
        }

        lineupIQs.push(lineupIQ)

        // Adjusted for display if duplicated, use original for calculations
        fptsHistories.push({
            managerID: key,
            fptsFor: round(leagueManagerRecord.fptsFor / 2),  // Display adjusted
            fptsAgainst: round(leagueManagerRecord.fptsAgainst / 2),  // Display adjusted
            fptsPerGame: round((leagueManagerRecord.fptsFor / denominator)), // Calculated with original values
        })

        if (originalTies > 0) showTies = true
    }

    // Only display-adjusted if these are duplicated
    for (const managerID in transactionTotals.allTime) {
        tradesData.push({
            managerID,
            trades: transactionTotals.allTime[managerID].trade / 2,  // Adjust if duplicated
        })
        waiversData.push({
            managerID,
            waivers: transactionTotals.allTime[managerID].waiver / 2,  // Adjust if duplicated
        })
    }

    // Sorting logic remains the same
    winPercentages.sort((a, b) => b.percentage - a.percentage)
    lineupIQs.sort((a, b) => b.iq - a.iq)
    fptsHistories.sort((a, b) => b.fptsFor - a.fptsFor)
    tradesData.sort((a, b) => b.trades - a.trades)
    waiversData.sort((a, b) => b.waivers - a.waivers)
}

    $: setRankingsData(leagueManagerRecords)
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

