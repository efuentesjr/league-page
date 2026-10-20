import { getLeagueData } from "./leagueData"
import { leagueID } from '$lib/utils/leagueInfo';
import { getNflState } from "./nflState"
import { waitForAll } from './multiPromise';
import { getRosterIDFromManagerIDAndYear } from '$lib/utils/helperFunctions/universalFunctions';
import { getLeagueTeamManagers } from "./leagueTeamManagers";
import { classifyBracketGame, maxBracketRound, getRivalryTier, GHOST_MANAGERS } from './playoffRounds';

export const getRivalryMatchups = async (userOneID, userTwoID) => {
    if(!userOneID || !userTwoID) {
        return;
    }

    let curLeagueID = leagueID;

	const [nflState, teamManagers] = await waitForAll(
		getNflState(),
		getLeagueTeamManagers(),
	).catch((err) => { console.error(err); });

	let week = 1;
	if(nflState.season_type == 'regular') {
		week = nflState.display_week;
	} else if(nflState.season_type == 'post') {
		week = 18;
	}

    const rivalry = {
        points: {
            one: 0,
            two: 0,
        },
        wins: {
            one: 0,
            two: 0,
        },
        ties: 0,
        // split by part of the season
        regular: { one: 0, two: 0, ties: 0 },
        playoffs: { one: 0, two: 0 },
        playoffMeetings: [],
        matchups: []
    }

    while(curLeagueID && curLeagueID != 0) {
        const leagueData = await getLeagueData(curLeagueID).catch((err) => { console.error(err); });
        const year = leagueData.season;
        const rosterIDOne = getRosterIDFromManagerIDAndYear(teamManagers, userOneID, year);
        const rosterIDTwo = getRosterIDFromManagerIDAndYear(teamManagers, userTwoID, year);
        if(!rosterIDOne || !rosterIDTwo || rosterIDOne == rosterIDTwo) {
            curLeagueID = leagueData.previous_league_id;
            week = 18;
            continue;
        }

        // pull in all matchup data for the season
        const matchupsPromises = [];
        for(let i = 1; i < leagueData.settings.playoff_week_start; i++) {
            matchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${curLeagueID}/matchups/${i}`, {compress: true}))
        }
        const matchupsRes = await waitForAll(...matchupsPromises);

        // convert the json matchup responses
        const matchupsJsonPromises = [];
        for(const matchupRes of matchupsRes) {
            const data = matchupRes.json();
            matchupsJsonPromises.push(data)
            if (!matchupRes.ok) {
                throw new Error(data);
            }
        }
        const matchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => { console.error(err); }).catch((err) => { console.error(err); });

        // process all the matchups
        for(let i = 1; i < matchupsData.length + 1; i++) {
            const processed = processRivalryMatchups(matchupsData[i - 1], i, rosterIDOne, rosterIDTwo);
            if(processed) {
                const {matchup, week} = processed;
                const sideA = matchup[0];
                const sideB = matchup[1];
                let sideAPoints = sideA.points.reduce((t, nV) => t + nV, 0);
                let sideBPoints = sideB.points.reduce((t, nV) => t + nV, 0);
                // a scheduled game that hasn't been played yet
                if(sideAPoints === 0 && sideBPoints === 0) continue;
                rivalry.points.one += sideAPoints;
                rivalry.points.two += sideBPoints;
                if(sideAPoints > sideBPoints) {
                    rivalry.wins.one++;
                    rivalry.regular.one++;
                } else if(sideAPoints < sideBPoints) {
                    rivalry.wins.two++;
                    rivalry.regular.two++;
                } else {
                    rivalry.ties++;
                    rivalry.regular.ties++;
                }
                rivalry.matchups.push({
                    week,
                    year,
                    matchup,
                })
            }
        }

        // playoff meetings (championship bracket only, no placement games)
        await addPlayoffMeetings(rivalry, leagueData, curLeagueID, year, rosterIDOne, rosterIDTwo);

        curLeagueID = leagueData.previous_league_id;
        week = 18;
    }

    rivalry.matchups.sort((a, b) => {
        var yearOrder = b.year - a.year;
        var weekOrder = b.week - a.week;
        return yearOrder || weekOrder;
    });

    rivalry.playoffMeetings.sort((a, b) => b.year - a.year || b.depth - a.depth);
    // a matchup with a former manager is a Ghost Rivalry
    const ghostID = [userOneID, userTwoID].find((id) => GHOST_MANAGERS[String(id)]);
    const ghost = ghostID
        ? {
            name: teamManagers.users?.[ghostID]?.display_name || GHOST_MANAGERS[String(ghostID)],
            lastSeason: rivalry.matchups.reduce((max, m) => Math.max(max, Number(m.year) || 0), 0) || null,
        }
        : null;
    rivalry.tier = getRivalryTier(rivalry.playoffMeetings, rivalry.matchups.length, ghost);

	return rivalry;
}

const addPlayoffMeetings = async (rivalry, leagueData, curLeagueID, year, rosterIDOne, rosterIDTwo) => {
    let bracket;
    try {
        const res = await fetch(`https://api.sleeper.app/v1/league/${curLeagueID}/winners_bracket`, {compress: true});
        if(!res.ok) return;
        bracket = await res.json();
    } catch (err) {
        console.error(err);
        return;
    }
    if(!Array.isArray(bracket) || !bracket.length) return;

    const maxRound = maxBracketRound(bracket);
    const one = parseInt(rosterIDOne);
    const two = parseInt(rosterIDTwo);

    for(const game of bracket) {
        const teams = [parseInt(game.t1), parseInt(game.t2)];
        if(!teams.includes(one) || !teams.includes(two) || !game.w) continue;

        const stage = classifyBracketGame(game, maxRound);
        if(!stage) continue;

        const week = parseInt(leagueData.settings.playoff_week_start) + (parseInt(game.r) || 1) - 1;
        const winnerSide = parseInt(game.w) === one ? 'one' : 'two';

        // pull that week's lineups so the game shows in the matchup viewer
        let matchup = null;
        try {
            const res = await fetch(`https://api.sleeper.app/v1/league/${curLeagueID}/matchups/${week}`, {compress: true});
            if(res.ok) {
                const weekData = await res.json();
                const sideOne = weekData.find(m => parseInt(m.roster_id) === one);
                const sideTwo = weekData.find(m => parseInt(m.roster_id) === two);
                if(sideOne && sideTwo) {
                    matchup = [sideOne, sideTwo].map(m => ({
                        roster_id: m.roster_id,
                        starters: m.starters,
                        points: m.starters_points,
                    }));
                }
            }
        } catch (err) {
            console.error(err);
        }

        let pointsOne = null;
        let pointsTwo = null;
        if(matchup) {
            pointsOne = matchup[0].points.reduce((t, nV) => t + nV, 0);
            pointsTwo = matchup[1].points.reduce((t, nV) => t + nV, 0);
            rivalry.points.one += pointsOne;
            rivalry.points.two += pointsTwo;
            rivalry.matchups.push({ week, year, matchup, label: stage.label, playoff: true });
        }

        rivalry.wins[winnerSide]++;
        rivalry.playoffs[winnerSide]++;
        rivalry.playoffMeetings.push({
            year,
            week,
            ...stage,
            winnerSide,
            winnerRosterID: parseInt(game.w),
            pointsOne,
            pointsTwo,
        });
    }
}

const processRivalryMatchups = (inputMatchups, week, rosterIDOne, rosterIDTwo) => {
	if(!inputMatchups || inputMatchups.length == 0) {
		return false;
	}
	const matchups = {};
	for(const match of inputMatchups) {
        if(match.roster_id == rosterIDOne || match.roster_id == rosterIDTwo) {
            if(!matchups[match.matchup_id]) {
                matchups[match.matchup_id] = [];
            }
            matchups[match.matchup_id].push({
                roster_id: match.roster_id,
                starters: match.starters,
                points: match.starters_points,
            })
        }
	}
    const keys = Object.keys(matchups);
    const matchup = matchups[keys[0]];
    // if the two teams played each other, there will only be one matchup, or if
    // there is one matchup that only has half the matchup, then one of the teams wasn't in the league yet
    if(keys.length > 1 || matchup.length == 1) {
        return;
    }
    // make sure that the order matches
    if(matchup[0].roster_id == rosterIDTwo) {
        const two = matchup.shift();
        matchup.push(two);
    }
	return {matchup, week};
}
