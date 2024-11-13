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

    // Calculate All-Time Win Percentage Rankings accurately
    for (const key in lRR) {
        const leagueManagerRecord = lRR[key]
        
        // Use original values for percentage calculation
        const totalGames = leagueManagerRecord.wins + leagueManagerRecord.ties + leagueManagerRecord.losses
        const denominator = totalGames > 0 ? totalGames : 1
        const percentage = round((leagueManagerRecord.wins + leagueManagerRecord.ties / 2) / denominator * 100)

        winPercentages.push({
            managerID: key,
            percentage,  // Calculated accurately
            // Store original counts for accurate display later if needed
            wins: leagueManagerRecord.wins,
            ties: leagueManagerRecord.ties,
            losses: leagueManagerRecord.losses
        })
    }

    // Adjust for display values (optional, only where you see duplicates)
    for (let i = 0; i < winPercentages.length; i++) {
        winPercentages[i].wins = winPercentages[i].wins / 2  // Adjust only if display duplication occurs here
        winPercentages[i].ties = winPercentages[i].ties / 2
        winPercentages[i].losses = winPercentages[i].losses / 2
    }

    // Populate and adjust other data points, using original data only for calculations, adjust where necessary
    for (const key in lRR) {
        const leagueManagerRecord = lRR[key]
        let lineupIQ = {
            managerID: key,
            fpts: round(leagueManagerRecord.fptsFor / 2)  // Adjust if this data is duplicated in display
        }

        if (leagueManagerRecord.potentialPoints) {
            lineupIQ.iq = round((leagueManagerRecord.fptsFor / leagueManagerRecord.potentialPoints) * 100)  // Use original values here
            lineupIQ.potentialPoints = round(leagueManagerRecord.potentialPoints / 2)  // Adjust if needed
        }
        lineupIQs.push(lineupIQ)

        fptsHistories.push({
            managerID: key,
            fptsFor: round(leagueManagerRecord.fptsFor / 2),  // Adjust if display shows duplication
            fptsAgainst: round(leagueManagerRecord.fptsAgainst / 2),  // Adjust if needed
            fptsPerGame: round((leagueManagerRecord.fptsFor / denominator)) // Original values for calculations
        })
        
        if (leagueManagerRecord.ties > 0) showTies = true
    }

    // Handle transaction totals with similar display adjustments
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

    // Sort the arrays for accurate rankings
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

