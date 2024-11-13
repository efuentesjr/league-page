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
        const wins = leagueManagerRecord.wins / 2  // Adjust count for display
        const ties = leagueManagerRecord.ties / 2   // Adjust count for display
        const losses = leagueManagerRecord.losses / 2 // Adjust count for display
        const denominator = (leagueManagerRecord.wins + leagueManagerRecord.ties + leagueManagerRecord.losses) > 0
            ? (leagueManagerRecord.wins + leagueManagerRecord.ties + leagueManagerRecord.losses)
            : 1
        
        // Use original values for percentage calculation
        winPercentages.push({
            managerID: key,
            percentage: round((leagueManagerRecord.wins + leagueManagerRecord.ties / 2) / denominator * 100), // Correct percentage
            wins,  // Display-adjusted wins
            ties,  // Display-adjusted ties
            losses // Display-adjusted losses
        })

        // Other stats, adjust only where duplication exists
        let lineupIQ = {
            managerID: key,
            fpts: round(leagueManagerRecord.fptsFor / 2)  // Divide fpts by 2 for display if duplicated
        }

        if (leagueManagerRecord.potentialPoints) {
            lineupIQ.iq = round((leagueManagerRecord.fptsFor / leagueManagerRecord.potentialPoints) * 100) // Use original values here
            lineupIQ.potentialPoints = round(leagueManagerRecord.potentialPoints / 2)  // Adjust only if duplicated
        }

        lineupIQs.push(lineupIQ)

        // Adjust fpts for display if duplicated, but keep calculation intact
        fptsHistories.push({
            managerID: key,
            fptsFor: round(leagueManagerRecord.fptsFor / 2),  // Display-adjusted if duplicated
            fptsAgainst: round(leagueManagerRecord.fptsAgainst / 2),  // Display-adjusted if duplicated
            fptsPerGame: round((leagueManagerRecord.fptsFor / denominator)), // Calculation correct
        })

        if (leagueManagerRecord.ties > 0) showTies = true
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

