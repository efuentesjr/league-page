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
        const denominator = (leagueManagerRecord.wins + leagueManagerRecord.ties + leagueManagerRecord.losses) > 0
            ? (leagueManagerRecord.wins + leagueManagerRecord.ties + leagueManagerRecord.losses)
            : 1
        
        winPercentages.push({
            managerID: key,
            percentage: round(((leagueManagerRecord.wins + leagueManagerRecord.ties / 2) / denominator * 100) / 2), // Divide percentage by 2
            wins: leagueManagerRecord.wins / 2,  // Divide wins by 2
            ties: leagueManagerRecord.ties / 2,  // Divide ties by 2
            losses: leagueManagerRecord.losses / 2,  // Divide losses by 2
        })

        let lineupIQ = {
            managerID: key,
            fpts: round(leagueManagerRecord.fptsFor / 2),  // Divide fpts by 2
        }

        if (leagueManagerRecord.potentialPoints) {
            lineupIQ.iq = round((leagueManagerRecord.fptsFor / leagueManagerRecord.potentialPoints * 100) / 2)  // Divide iq by 2
            lineupIQ.potentialPoints = round(leagueManagerRecord.potentialPoints / 2)  // Divide potentialPoints by 2
        }

        lineupIQs.push(lineupIQ)

        fptsHistories.push({
            managerID: key,
            fptsFor: round(leagueManagerRecord.fptsFor / 2),  // Divide fptsFor by 2
            fptsAgainst: round(leagueManagerRecord.fptsAgainst / 2),  // Divide fptsAgainst by 2
            fptsPerGame: round((leagueManagerRecord.fptsFor / denominator) / 2),  // Divide fptsPerGame by 2
        })

        if (leagueManagerRecord.ties > 0) showTies = true
    }

    for (const managerID in transactionTotals.allTime) {
        tradesData.push({
            managerID,
            trades: transactionTotals.allTime[managerID].trade / 2,  // Divide trades by 2
        })
        waiversData.push({
            managerID,
            waivers: transactionTotals.allTime[managerID].waiver / 2,  // Divide waivers by 2
        })
    }

    // Sort the arrays for display
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

