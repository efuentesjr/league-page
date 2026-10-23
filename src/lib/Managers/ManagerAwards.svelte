<script>
    import { round } from "$lib/utils/helper";
    import { calculateManagerLineupIQ } from "$lib/utils/managerLineupIQ";
	import { checkIfManagerReceivedAward, getTeamNameFromTeamManagers } from "$lib/utils/helperFunctions/universalFunctions";

    export let awards, records, rosterID, tookOver, leagueTeamManagers, managerID;
    // 'awards' = titles only, 'records' = record book only, 'all' = both
    export let section = 'all';

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
        // same Manager Lineup IQ as the Records page (70% efficiency, 30% roster strength)
        const iqRecords = calculateManagerLineupIQ(records.regularSeasonData.leagueManagerRecords)
            .map((m) => ({ ...m, rosterID: m.managerID }));

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
                    extraInfo: iqRecord.iq,
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

    /*
     * Trophy-case order: championships first, then 2nd, 3rd, division titles,
     * all-time records (#1, #2, #3), and the Toilet Bowl last. Newest first
     * within each tier.
     */
    const tierOf = (a) => {
        if (a.type === 'award') {
            const name = String(a.award).toLowerCase();
            if (name === 'champion') return 0;
            if (name === 'second') return 1;
            if (name === 'third') return 2;
            if (name.includes('champion')) return 3; // division / regular season
            if (name === 'toilet') return 9;
            return 8;
        }
        return 3 + (Number(a.award) || 5); // records: #1 -> 4, #2 -> 5, #3 -> 6
    };
    const metalOf = (a) => {
        const t = tierOf(a);
        if (t === 0 || t === 3 || t === 4) return 'gold';
        if (t === 1 || t === 5) return 'silver';
        if (t === 2 || t === 6) return 'bronze';
        return 'plain';
    };
    const yearOf = (a) => Number(a.year) || Number(String(a.type).slice(0, 4)) || 0;

    $: computePodiums(rosterID);
    $: sortedAwards = [...displayAwards].sort((x, y) => tierOf(x) - tierOf(y) || yearOf(y) - yearOf(x));
    $: titles = sortedAwards.filter((a) => a.type === 'award');
    $: recordRows = sortedAwards.filter((a) => a.type !== 'award');
    $: allTimeRows = recordRows.filter((a) => String(a.type).startsWith('All-Time'));
    $: seasonRows = recordRows.filter((a) => !String(a.type).startsWith('All-Time'));
    $: formerTitles = titles.some((a) => a.former);
    $: formerRecords = recordRows.some((a) => a.former);

    const titleKicker = (a) => {
        const t = tierOf(a);
        if (t === 0) return 'League Champion';
        if (t === 1) return 'Runner-up';
        if (t === 2) return 'Third Place';
        if (t === 3) return String(a.award).replace(/ Champion$/, '');
        if (t === 9) return 'Toilet Bowl';
        return String(a.award);
    };
    const titleName = (a) => {
        const t = tierOf(a);
        if (t === 0) return '1st Place';
        if (t === 1) return '2nd Place';
        if (t === 2) return '3rd Place';
        if (t === 3) return 'Division Title';
        if (t === 9) return 'Consolation Champion';
        return computeAward(a.award);
    };
    const placeText = (n) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`);
    const recordStat = (a) =>
        `${a.year ? `${a.year} ` : ''}${a.week ? `Week ${a.week} · ` : a.year ? '· ' : ''}${a.extraInfo}${a.wins ? ' wins' : a.iq ? '%' : ' pts'}`;

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
        box-sizing: border-box;
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

    /* metal per tier: the hex edge and title pick up silver / bronze */
    .award.silver {
        --metal: linear-gradient(150deg, #ffffff 0%, #c9d1dc 25%, #6d7785 55%, #c9d1dc 80%, #ffffff 100%);
        --metal-text: linear-gradient(180deg, #ffffff, #c9d1dc 55%, #8b95a3);
        --metal-glow: rgba(201, 209, 220, 0.45);
        border-top-color: #c9d1dc;
        border-color: rgba(201, 209, 220, 0.25);
    }

    .award.bronze {
        --metal: linear-gradient(150deg, #ffe0c2 0%, #e0a46a 25%, #8a5122 55%, #e0a46a 80%, #ffe0c2 100%);
        --metal-text: linear-gradient(180deg, #ffe7cf, #e0a46a 55%, #a8662f);
        --metal-glow: rgba(224, 164, 106, 0.45);
        border-top-color: #e0a46a;
        border-color: rgba(224, 164, 106, 0.25);
    }

    .award.plain {
        --metal: linear-gradient(150deg, #9fb3cc 0%, #5d708a 50%, #9fb3cc 100%);
        --metal-text: linear-gradient(180deg, #e8f4ff, #9fb3cc);
        --metal-glow: rgba(112, 136, 170, 0.35);
        border-top-color: var(--mf-plasma);
        border-color: var(--mf-line);
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
        filter: drop-shadow(0 0 10px var(--metal-glow, rgba(245, 213, 107, 0.45)));
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
        background: var(--metal, linear-gradient(150deg, #fff3c4 0%, #f5d56b 25%, #a7781d 55%, #f5d56b 80%, #fff3c4 100%));
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
        background: var(--metal-text, linear-gradient(180deg, #fff6d0, #f5d56b 55%, #c9962c));
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
        .awardsCase {
            padding: 12px 8px;
        }
        .awardsCaseInner {
            gap: 6px;
        }
        .award {
            width: calc((100% - 12px) / 3);
            padding: 10px 4px 10px;
            clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
        }
        .awardHeader {
            min-height: 2.6em;
            margin-bottom: 6px;
            font-size: 0.52rem;
            letter-spacing: 0.06em;
        }
        .awardIcon {
            width: 52px;
            height: 60px;
        }
        .awardLabel {
            margin-top: 7px;
            font-size: 0.72rem;
        }
        .subText {
            font-size: 0.6rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .awardsCase::before,
        .awardIcon::after,
        .champ .hexWrap {
            animation: none;
        }
    }

    /* ================= TITLES: more bling ================= */
    .titlesCase {
        position: relative;
        padding: 22px 14px 18px;
        overflow: hidden;
        background:
            radial-gradient(ellipse at 50% -20%, rgba(255, 215, 0, 0.22), transparent 60%),
            radial-gradient(circle at 15% 120%, rgba(245, 213, 107, 0.08), transparent 45%),
            radial-gradient(circle at 85% 120%, rgba(245, 213, 107, 0.08), transparent 45%);
    }

    .titlesCase::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(115deg, transparent 40%, rgba(255, 236, 170, 0.1) 50%, transparent 60%);
        background-size: 250% 100%;
        animation: caseSweep 6s linear infinite;
        pointer-events: none;
    }

    .titlesInner {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
    }

    .title {
        --metal: linear-gradient(150deg, #fff7d6 0%, #ffd84d 22%, #a8761a 50%, #ffd84d 78%, #fff7d6 100%);
        --metal-text: linear-gradient(180deg, #fffbe8, #ffd84d 50%, #c48a1e);
        --metal-glow: rgba(255, 210, 60, 0.6);
        --edge: #f5d56b;
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 200px;
        padding: 16px 12px 18px;
        text-align: center;
        isolation: isolate;
        overflow: hidden;
        background:
            radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--edge) 26%, transparent), transparent 70%),
            linear-gradient(180deg, #1a1606, var(--mf-panel-2) 60%);
        border: 1px solid color-mix(in srgb, var(--edge) 55%, transparent);
        border-top: 3px solid var(--edge);
        box-shadow: inset 0 0 30px -12px var(--metal-glow);
        clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
        transition: transform 0.25s ease;
    }

    /* foil sheen sweeping across each card */
    .title::after {
        content: '';
        position: absolute;
        inset: -40% -60%;
        z-index: -1;
        background: linear-gradient(105deg, transparent 42%, rgba(255, 245, 200, 0.16) 50%, transparent 58%);
        transform: translateX(-60%);
        animation: foil 5s ease-in-out infinite;
        animation-delay: var(--d, 0s);
        pointer-events: none;
    }

    @keyframes foil {
        0%, 55% { transform: translateX(-60%); }
        85%, 100% { transform: translateX(60%); }
    }

    .title:hover {
        transform: translateY(-4px) scale(1.02);
    }

    .title.silver {
        --metal: linear-gradient(150deg, #ffffff 0%, #d7dee8 25%, #6d7785 52%, #d7dee8 78%, #ffffff 100%);
        --metal-text: linear-gradient(180deg, #ffffff, #d7dee8 55%, #8b95a3);
        --metal-glow: rgba(215, 222, 232, 0.5);
        --edge: #d7dee8;
    }

    .title.silver {
        background:
            radial-gradient(ellipse at 50% 30%, rgba(215, 222, 232, 0.2), transparent 70%),
            linear-gradient(180deg, #13161c, var(--mf-panel-2) 60%);
    }

    .title.bronze {
        --metal: linear-gradient(150deg, #ffe4c8 0%, #e3a56b 25%, #8a5122 52%, #e3a56b 78%, #ffe4c8 100%);
        --metal-text: linear-gradient(180deg, #ffe9d4, #e3a56b 55%, #a8662f);
        --metal-glow: rgba(227, 165, 107, 0.5);
        --edge: #e3a56b;
        background:
            radial-gradient(ellipse at 50% 30%, rgba(227, 165, 107, 0.2), transparent 70%),
            linear-gradient(180deg, #19110a, var(--mf-panel-2) 60%);
    }

    .title.plain {
        --metal: linear-gradient(150deg, #b9c7da 0%, #5d708a 50%, #b9c7da 100%);
        --metal-text: linear-gradient(180deg, #e8f4ff, #9fb3cc);
        --metal-glow: rgba(112, 136, 170, 0.4);
        --edge: var(--mf-plasma);
        background: linear-gradient(180deg, #0d1422, var(--mf-panel-2) 60%);
    }

    .title.champ {
        width: 230px;
        border-top-width: 4px;
        box-shadow: inset 0 0 40px -10px rgba(255, 215, 0, 0.75);
    }

    .titleKicker {
        min-height: 1.2em;
        font-size: 0.66rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        background: var(--metal-text);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    .hexWrap.big {
        position: relative;
        margin: 12px 0 10px;
        filter: drop-shadow(0 0 14px var(--metal-glow));
    }

    .champ .hexWrap.big {
        animation: champPulse 2.4s ease-in-out infinite;
    }

    .hexWrap.big .awardIcon {
        width: 96px;
        height: 110px;
        background: var(--metal);
    }

    .champ .hexWrap.big .awardIcon {
        width: 112px;
        height: 128px;
    }

    .hexWrap.big .awardIcon::before {
        inset: 4px;
    }

    .hexWrap.big .awardImage {
        inset: 4px;
        width: calc(100% - 8px);
        height: calc(100% - 8px);
    }

    /* slow spinning ray burst behind the trophy */
    .halo {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: -1;
        width: 170px;
        height: 170px;
        margin: -85px 0 0 -85px;
        border-radius: 50%;
        background: repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--edge) 38%, transparent) 0deg 8deg, transparent 8deg 22deg);
        -webkit-mask: radial-gradient(circle, #000 25%, transparent 70%);
        mask: radial-gradient(circle, #000 25%, transparent 70%);
        animation: spin 18s linear infinite;
        opacity: 0.85;
    }

    .champ .halo {
        width: 210px;
        height: 210px;
        margin: -105px 0 0 -105px;
        animation-duration: 12s;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .titleYear {
        font-size: 1.9rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.04em;
        background: var(--metal-text);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        filter: drop-shadow(0 0 10px var(--metal-glow));
        font-variant-numeric: tabular-nums;
    }

    .champ .titleYear {
        font-size: 2.3rem;
    }

    .titleName {
        margin-top: 4px;
        font-size: 0.86rem;
        font-weight: 600;
        color: var(--mf-text);
    }

    /* twinkling sparkles */
    .spark {
        position: absolute;
        z-index: 1;
        width: 6px;
        height: 6px;
        background: #fff;
        clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
        filter: drop-shadow(0 0 4px var(--edge));
        opacity: 0;
        animation: twinkle 3.2s ease-in-out infinite;
        pointer-events: none;
    }

    .spark.s1 { top: 22%; left: 16%; animation-delay: calc(var(--d, 0s) + 0.2s); }
    .spark.s2 { top: 30%; right: 14%; width: 9px; height: 9px; animation-delay: calc(var(--d, 0s) + 1.1s); }
    .spark.s3 { top: 58%; left: 12%; width: 8px; height: 8px; animation-delay: calc(var(--d, 0s) + 1.9s); }
    .spark.s4 { top: 50%; right: 18%; animation-delay: calc(var(--d, 0s) + 2.6s); }
    .title.plain .spark { display: none; }

    @keyframes twinkle {
        0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
        15% { opacity: 1; transform: scale(1.1) rotate(45deg); }
        30% { opacity: 0; transform: scale(0.4) rotate(90deg); }
    }

    /* ================= RECORDS: compact list ================= */
    .recordsCase {
        padding: 6px 14px 14px;
    }

    .recGroup + .recGroup {
        margin-top: 10px;
    }

    .recGroupHead {
        padding: 8px 0 6px;
        font-size: 0.66rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--mf-dim);
        border-bottom: 1px solid var(--mf-line);
    }

    .recRow {
        --metal: linear-gradient(150deg, #fff3c4, #f5d56b 30%, #a7781d 60%, #f5d56b);
        --tone: #f5d56b;
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) auto auto;
        align-items: center;
        gap: 10px;
        padding: 7px 0;
        border-bottom: 1px solid var(--mf-line);
    }

    .recRow:last-child {
        border-bottom: 0;
    }

    .recRow.silver {
        --metal: linear-gradient(150deg, #ffffff, #c9d1dc 30%, #6d7785 60%, #c9d1dc);
        --tone: #c9d1dc;
    }

    .recRow.bronze {
        --metal: linear-gradient(150deg, #ffe0c2, #e0a46a 30%, #8a5122 60%, #e0a46a);
        --tone: #e0a46a;
    }

    .recRow.plain {
        --metal: linear-gradient(150deg, #9fb3cc, #5d708a);
        --tone: var(--mf-plasma);
    }

    .recHex {
        position: relative;
        width: 34px;
        height: 39px;
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        background: var(--metal);
    }

    .recHex img {
        position: absolute;
        inset: 2px;
        width: calc(100% - 4px);
        height: calc(100% - 4px);
        object-fit: cover;
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        background: #050a16;
    }

    .recName {
        min-width: 0;
        font-size: 0.88rem;
        font-weight: 600;
    }

    .recPlace {
        min-width: 36px;
        padding: 1px 6px;
        font-size: 0.7rem;
        font-weight: 700;
        text-align: center;
        color: var(--tone);
        border: 1px solid color-mix(in srgb, var(--tone) 60%, transparent);
    }

    .recStat {
        min-width: 120px;
        font-size: 0.8rem;
        text-align: right;
        color: var(--mf-dim);
        font-variant-numeric: tabular-nums;
    }

    @media (max-width: 560px) {
        .title,
        .title.champ {
            width: calc(50% - 8px);
            padding: 12px 6px 14px;
        }
        .titlesInner {
            gap: 10px;
        }
        .hexWrap.big .awardIcon,
        .champ .hexWrap.big .awardIcon {
            width: 72px;
            height: 83px;
        }
        .halo,
        .champ .halo {
            width: 130px;
            height: 130px;
            margin: -65px 0 0 -65px;
        }
        .titleYear,
        .champ .titleYear {
            font-size: 1.5rem;
        }
        .recRow {
            grid-template-columns: 34px minmax(0, 1fr) auto;
        }
        .recStat {
            grid-column: 2 / -1;
            min-width: 0;
            text-align: left;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .titlesCase::before,
        .title::after,
        .halo,
        .spark,
        .champ .hexWrap.big {
            animation: none;
        }
    }
</style>

{#if section !== 'records'}
<div class="titlesCase">
    <div class="titlesInner">
        {#each titles as award, i}
            <div class="title {metalOf(award)}" class:champ={tierOf(award) === 0} style="--d: {(i % 5) * 0.9}s">
                <span class="spark s1" aria-hidden="true"></span>
                <span class="spark s2" aria-hidden="true"></span>
                <span class="spark s3" aria-hidden="true"></span>
                <span class="spark s4" aria-hidden="true"></span>
                <div class="titleKicker">{titleKicker(award)}</div>
                <div class="hexWrap big">
                    <span class="halo" aria-hidden="true"></span>
                    <div class="awardIcon" style="--d: {(i % 5) * 0.9}s">
                        <img class="awardImage" src="{award.icon}" alt="" />
                    </div>
                </div>
                <div class="titleYear">{award.year}{award.former ? '*' : ''}</div>
                <div class="titleName">{titleName(award)}</div>
            </div>
        {:else}
            <p class="sad">No titles yet.</p>
        {/each}
    </div>
    {#if formerTitles}
        <p class="disclaimer">*Won under a previous manager</p>
    {/if}
</div>
{/if}

{#if section !== 'awards'}
<div class="recordsCase">
    {#each [['All-Time Records', allTimeRows], ['Season Records', seasonRows]] as [label, rows]}
        {#if rows.length}
            <div class="recGroup">
                <div class="recGroupHead">{label}</div>
                {#each rows as award}
                    <div class="recRow {metalOf(award)}">
                        <div class="recHex"><img src="{award.icon}" alt="" /></div>
                        <div class="recName">{award.type.replace(/^All-Time /, '')}</div>
                        <span class="recPlace">{placeText(award.award)}</span>
                        <span class="recStat">{recordStat(award)}{award.former ? '*' : ''}</span>
                    </div>
                {/each}
            </div>
        {/if}
    {/each}
    {#if !recordRows.length}
        <p class="sad">Not in the record book yet.</p>
    {/if}
    {#if formerRecords}
        <p class="disclaimer">*Set under a previous manager</p>
    {/if}
</div>
{/if}
