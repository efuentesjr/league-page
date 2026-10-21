<script>
    import { round } from "$lib/utils/helper";
	import { checkIfManagerReceivedAward, getTeamNameFromTeamManagers } from "$lib/utils/helperFunctions/universalFunctions";

    export let awards, records, rosterID, tookOver, leagueTeamManagers, managerID;

    let displayAwards = [];

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    let formerGlobal = false;

    const checkIfDeserves = (awardRosterID, userRosterID, year) => {
        if(!managerID || !year || !awardRosterID) {
            return awardRosterID == userRosterID;
        }
        return checkIfManagerReceivedAward(leagueTeamManagers, awardRosterID, year, managerID);
    }

    const checkIfDeservesWithManagerID = (recordManagerID, userRosterID) => {
        if(managerID) {
            return recordManagerID == managerID;
        }
        for(const year in leagueTeamManagers.teamManagersMap) {
            for(const rosterID in  leagueTeamManagers.teamManagersMap[year]) {
                if(leagueTeamManagers.teamManagersMap[year][rosterID].managers.indexOf(recordManagerID) > -1) {
                    return rosterID == userRosterID;
                }
            }
        }
        return false;
    }

    const computePodiums = (cRosterID) => {
        formerGlobal = false;
        displayAwards = [];

        // first look through annual awards (champion, second, etc)
        for(const podium of awards) {
            for(const award in podium) {
                if(award == 'year') continue;
                if(award == 'divisions') {
                    for(const division of podium[award]) {
                        if(checkIfDeserves(division.rosterID, cRosterID, podium.year)) {
                            const former = tookOver && tookOver > podium.year;
                            if(former) {
                                formerGlobal = true;
                            }
                            let awardTitle = 'Regular Season Champion';
                            if(division.name) {
                                awardTitle = `${division.name} Division Champion`;
                            }
                            displayAwards.push({
                                award: awardTitle,
                                icon: '/awards/division.png',
                                type: 'award',
                                originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, podium.year),
                                year: podium.year,
                                former
                            })
                        }
                    }
                } else if(checkIfDeserves(podium[award], cRosterID, podium.year)) {
                    const former = tookOver && tookOver > podium.year;
                    if(former) {
                        formerGlobal = true;
                    }
                    displayAwards.push({
                        award: capitalizeFirstLetter(award),
                        icon: '/awards/' + award + '.png',
                        type: 'award',
                        originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, podium.year),
                        year: podium.year,
                        former
                    })
                }
            }
        }

        // Next look through record books
        const leagueManagerRecords = [];
        for(const key in records.regularSeasonData.leagueManagerRecords) {
            const record = records.regularSeasonData.leagueManagerRecords[key];
            record.rosterID = key;
            leagueManagerRecords.push(record);
        }
        const winRecords = [...leagueManagerRecords].sort((a, b) => b.wins - a.wins);
        const pointsRecords = [...leagueManagerRecords].sort((a, b) => b.fptsFor - a.fptsFor);
        const iqRecords = [...leagueManagerRecords].sort((a, b) => (b.fptsFor/b.potentialPoints) - (a.fptsFor/a.potentialPoints));

        for(let i = 0; i < records.regularSeasonData.leagueWeekHighs.length; i++) {
            const leagueWeekRecord = records.regularSeasonData.leagueWeekHighs[i];
            const seasonLongRecord = records.regularSeasonData.mostSeasonLongPoints[i];
            const winRecord = winRecords[i];
            const pointsRecord = pointsRecords[i];
            const iqRecord = iqRecords[i];

            if(checkIfDeservesWithManagerID(winRecord?.rosterID, cRosterID) && i < 3) {
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/record-' + (i+1) + '.png',
                    type: 'All-Time Wins Record',
                    extraInfo: winRecord.wins,
                    wins: true
                })
            }

            if(checkIfDeservesWithManagerID(pointsRecord?.rosterID, cRosterID) && i < 3) {
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/record-' + (i+1) + '.png',
                    type: 'All-Time Fantasy Points Record',
                    extraInfo: round(pointsRecord.fptsFor)
                })
            }

            if(checkIfDeservesWithManagerID(iqRecord?.rosterID, cRosterID) && i < 3) {
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/record-' + (i+1) + '.png',
                    type: 'All-Time Lineup IQ Record',
                    extraInfo: round(iqRecord.fptsFor * 100 / iqRecord.potentialPoints),
                    iq: true
                })
            }

            if(checkIfDeserves(leagueWeekRecord.rosterID, cRosterID, leagueWeekRecord.year)) {
                const former = tookOver && tookOver > leagueWeekRecord.year;
                if(former) {
                    formerGlobal = true;
                }
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/' + (i < 3 ? `record-${i+1}` : 'generic') + '.png',
                    type: 'All-Time Single Week Record',
                    originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, leagueWeekRecord.year),
                    year: leagueWeekRecord.year,
                    week: leagueWeekRecord.week,
                    extraInfo: leagueWeekRecord.fpts,
                    former
                })
            }

            if(checkIfDeserves(seasonLongRecord.rosterID, cRosterID, seasonLongRecord.year)) {
                const former = tookOver && tookOver > seasonLongRecord.year;
                if(former) {
                    formerGlobal = true;
                }
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/' + (i < 3 ? `record-${i+1}` : 'generic') + '.png',
                    type: 'All-Time Season Long Points',
                    originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, seasonLongRecord.year),
                    year: seasonLongRecord.year,
                    extraInfo: seasonLongRecord.fpts,
                    former
                })
            }
        }
        for(const yearRecords of records.regularSeasonData.seasonWeekRecords) {
            for(let i = 0; i < 3; i++) {
                const seasonPointsRecord = yearRecords.seasonPointsHighs[i];
                if(checkIfDeserves(seasonPointsRecord.rosterID, cRosterID, yearRecords.year)) {
                    const former = tookOver && tookOver > yearRecords.year;
                    if(former) {
                        formerGlobal = true;
                    }
                    displayAwards.push({
                        award: i + 1,
                        icon: '/awards/' + (i < 3 ? `record-${i+1}` : 'generic') + '.png',
                        type: `${yearRecords.year} Single Week Record`,
                        originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, seasonPointsRecord.year),
                        year: null,
                        week: seasonPointsRecord.week,
                        extraInfo: seasonPointsRecord.fpts,
                        former
                    })
                }
            }
        }
    }

    $: computePodiums(rosterID);

    const computeAward = (award) => {
        switch (award) {
            case 1:
                return '1st Place'
            case 2:
                return '2nd Place'
            case 3:
                return '3rd Place'
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                return award + 'th Place';
            case 'Champion':
                return award
            case 'Second':
            case 'Third':
                return award + ' Place'
            case 'Toilet':
                return award + ' Bowl'
            default:
                return award;
        }
    }
</script>

<style>
    .awardsCase {
        position: relative;
        padding: 18px 14px 16px;
        overflow: hidden;
        background:
            radial-gradient(ellipse at 50% -10%, rgba(245, 213, 107, 0.16), transparent 60%),
            radial-gradient(circle at 10% 110%, rgba(56, 232, 255, 0.08), transparent 45%);
    }

    /* slow light sweep across the whole case */
    .awardsCase::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(115deg, transparent 40%, rgba(255, 236, 170, 0.07) 50%, transparent 60%);
        background-size: 250% 100%;
        animation: caseSweep 7s linear infinite;
        pointer-events: none;
    }

    @keyframes caseSweep {
        from { background-position: 150% 0; }
        to { background-position: -100% 0; }
    }

    .awardsCaseInner {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 14px;
    }

    .award {
        width: 170px;
    }

    .award {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 14px 10px 16px;
        text-align: center;
        background:
            radial-gradient(ellipse at 50% 0%, rgba(245, 213, 107, 0.18), transparent 70%),
            var(--mf-panel-2);
        border: 1px solid rgba(245, 213, 107, 0.22);
        border-top: 2px solid #f5d56b;
        clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
        transition: transform 0.2s ease, background 0.2s ease;
    }

    .award:hover {
        transform: translateY(-3px);
        background:
            radial-gradient(ellipse at 50% 0%, rgba(245, 213, 107, 0.3), transparent 70%),
            var(--mf-panel-2);
    }

    .award.champ {
        border-color: rgba(255, 215, 0, 0.55);
        background:
            radial-gradient(ellipse at 50% 0%, rgba(255, 215, 0, 0.32), transparent 72%),
            var(--mf-panel-2);
    }

    .awardHeader {
        min-height: 2.4em;
        margin-bottom: 8px;
        font-size: 0.64rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        line-height: 1.2em;
        text-transform: uppercase;
        color: var(--mf-dim);
    }

    /* hexagon trophy with a gold edge, glow, and a light sweep */
    .hexWrap {
        filter: drop-shadow(0 0 10px rgba(245, 213, 107, 0.45));
    }

    .champ .hexWrap {
        animation: champPulse 2.6s ease-in-out infinite;
    }

    @keyframes champPulse {
        0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.45)); }
        50% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.95)); }
    }

    .awardIcon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 78px;
        height: 90px;
        isolation: isolate;
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        background: linear-gradient(150deg, #fff3c4 0%, #f5d56b 25%, #a7781d 55%, #f5d56b 80%, #fff3c4 100%);
    }

    .awardIcon::before {
        content: '';
        position: absolute;
        inset: 3px;
        z-index: -1;
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        background: radial-gradient(circle at 50% 35%, #1d2a45, #050a16 75%);
    }

    .awardIcon::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.55) 50%, transparent 65%);
        transform: translateX(-120%);
        animation: shine 4.5s ease-in-out infinite;
        animation-delay: var(--d, 0s);
        pointer-events: none;
    }

    @keyframes shine {
        0%, 60% { transform: translateX(-120%); }
        85%, 100% { transform: translateX(120%); }
    }

    .awardImage {
        position: absolute;
        inset: 3px;
        z-index: -1;
        width: calc(100% - 6px);
        height: calc(100% - 6px);
        object-fit: cover;
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
    }

    .awardLabel {
        margin-top: 10px;
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1.2em;
        background: linear-gradient(180deg, #fff6d0, #f5d56b 55%, #c9962c);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    .subText {
        margin-top: 4px;
        font-size: 0.74rem;
        line-height: 1.25em;
        color: var(--mf-dim);
    }

    .sad {
        margin: 6px 0;
        color: var(--mf-dim);
        font-style: italic;
    }

    .disclaimer {
        position: relative;
        margin: 12px 0 0;
        font-size: 0.75rem;
        font-style: italic;
        color: var(--mf-dim);
        text-align: center;
    }

    @media (max-width: 560px) {
        .awardsCaseInner {
            gap: 10px;
        }
        .award {
            width: calc(50% - 5px);
        }
        .awardIcon {
            width: 64px;
            height: 74px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .awardsCase::before,
        .awardIcon::after,
        .champ .hexWrap {
            animation: none;
        }
    }
</style>

<div class="awardsCase">
    <div class="awardsCaseInner">
        {#each displayAwards as award, i}
            <div class="award" class:champ={/champ|1st place/i.test(`${computeAward(award.award)}`) || award.award === 1}>
                <div class="awardHeader">{award.type != 'award' ? award.type : ''}</div>
                <div class="hexWrap">
                    <div class="awardIcon" style="--d: {(i % 6) * 0.7}s">
                        <img class="awardImage" src="{award.icon}" alt="trophy" />
                    </div>
                </div>
                <div class="awardLabel">{award.type == 'award' ? `${award.year} ` : ''}{computeAward(award.award)}{award.former ? '*' : ''}</div>
                {#if award.extraInfo}
                    <div class="subText">{award.year ? `${award.year} ` : ''}{award.week ? `Week ${award.week} ` : ''}{award.year || award.week ? ' - ' : ''}{award.extraInfo}{award.wins ? ' Wins' : ''}{award.iq ? '%' : ''}{!award.wins && !award.iq ? 'pts' : ''}</div>
                {/if}
            </div>
        {:else}
            <p class="sad">...nothing yet</p>
        {/each}
    </div>
    {#if formerGlobal}
        <p class="disclaimer">*Awarded under a previous manager</p>
    {/if}
</div>