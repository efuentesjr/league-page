<script>
  import {
    getTeamFromTeamManagers,
    round,
    predictScores,
    loadPlayers
  } from '$lib/utils/helper';

  import {
    getAvatarFromTeamManagers,
    gotoManager
  } from '$lib/utils/helperFunctions/universalFunctions';

  export let nflState;
  export let rostersData;
  export let leagueTeamManagers;
  export let playersInfo;
  export let leagueData;

  const rosters = rostersData.rosters;

  let validGraph = false;
  let seasonOver = false;
  let rankings = [];

  let players = playersInfo.players;

  // Existing MFFL team color variables
const teamColors = {
  "The People's Champ": '#7B2D2D',
  "CeeDees TDs": '#003594',
  "Chosen One": '#8C1D40',
  "Child Support": '#C60C30',
  "Bay Area Party Supplies": '#AA0000',
  "Brute Force Attack": '#C8102E',
  "SlickBears": '#B3995D',
  "TexasTimeshifts": '#BF5700',
  "Do it to them": '#006847',
  "Blue BaLLers": '#003DA5',
  "Remember the raiders": '#A5ACAF',
  "DemBoyz": '#041E42',
  "Vick2times": '#FB4F14',
  "Blue Tent All-Stars": '#0085CA',
  "Loud and Stroud": '#0085CA',
  "The Comeback Kid": '#AA0000'
};

function getTeamColor(team) {
  const name = team?.manager?.name || '';

  return teamColors[name] || '#34495E';
}

  const buildRankings = () => {
    const rosterPowers = [];

    let week = nflState.week;

    if (week == 0) {
      week = 1;
    }

    let max = 0;

    for (const rosterID in rosters) {
      const roster = rosters[rosterID];

      // Make sure the roster has players
      if (!roster.players) continue;

      validGraph = true;

      const rosterPlayers = [];

      for (const rosterPlayer of roster.players) {
        // Fixed typo from original component: contnue -> continue
        if (!players[rosterPlayer]) continue;

        rosterPlayers.push({
          name: players[rosterPlayer].ln,
          pos: players[rosterPlayer].pos,
          wi: players[rosterPlayer].wi
        });
      }

      const rosterPower = {
        rosterID,
        manager: getTeamFromTeamManagers(
          leagueTeamManagers,
          rosterID
        ),
        powerScore: 0
      };

      const seasonEnd = 18;

      if (week >= seasonEnd) {
        seasonOver = true;
      }

      for (let i = week; i < seasonEnd; i++) {
        rosterPower.powerScore += predictScores(
          rosterPlayers,
          i,
          leagueData
        );
      }

      if (rosterPower.powerScore > max) {
        max = rosterPower.powerScore;
      }

      rosterPowers.push(rosterPower);
    }

    // Normalize to 0–100
    for (const rosterPower of rosterPowers) {
      rosterPower.powerScore =
        max > 0
          ? round((rosterPower.powerScore / max) * 100)
          : 0;
    }

    // Highest power score = #1
rankings = rosterPowers
  .sort((a, b) => b.powerScore - a.powerScore)
  .map((team, index) => ({
    ...team,
    rank: index + 1,
    movement: '—',
    color: getTeamColor(team)
  }));
  };

  buildRankings();

  const refreshPlayers = async () => {
    const newPlayersInfo = await loadPlayers(null, true);

    players = newPlayersInfo.players;

    buildRankings();
  };

  if (playersInfo.stale) {
    refreshPlayers();
  }
</script>

<style>
  .powerRankings {
    width: 100%;
    max-width: 1000px;
    margin: 20px auto 0;
    padding: 0 12px 30px;
    box-sizing: border-box;
  }

  /* ================================
     HEADER
     ================================ */

  .rankingHeader {
    text-align: center;
    margin-bottom: 14px;
  }

  .rankingTitle {
    margin: 0;
    color: #d8a84e;
    font-family: Arial, sans-serif;
    font-size: 1.65rem;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .rankingSubtitle {
    margin-top: 4px;
    color: #aaa;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* ================================
     TWO-COLUMN BOARD
     ================================ */

  .rankingGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 14px;
  }

  .rankingColumn {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* ================================
     INDIVIDUAL RANKING
     ================================ */

  .rankingCard {
    position: relative;
    display: grid;
    grid-template-columns: 45px 42px minmax(0, 1fr) auto;
    align-items: center;
    min-height: 58px;
    overflow: hidden;

    background:
      linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.055),
        rgba(255, 255, 255, 0.018)
      );

    border: 1px solid rgba(255, 255, 255, 0.13);
    border-left: 5px solid var(--teamColor);

    box-shadow:
      0 2px 5px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    transition:
      transform 0.15s ease,
      background 0.15s ease;
  }

  .rankingCard:hover {
    transform: translateX(2px);

    background:
      linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.09),
        rgba(255, 255, 255, 0.025)
      );
  }

  /* ================================
     RANK NUMBER
     ================================ */

.rankNumber {
  padding-left: 10px;

  color: #fff;

  font-family: Arial, sans-serif;
  font-size: 1.65rem;
  font-weight: 900;

  line-height: 1;

  text-shadow:
    1px 2px 3px rgba(0, 0, 0, 0.8);
}

.rankNumber.topThree {
  color: #fff;
}

  /* ================================
     AVATAR
     ================================ */

.avatar {
  width: 52px;
  height: 52px;

  object-fit: contain;

  border-radius: 50%;

  border: 2px solid rgba(255, 255, 255, 0.75);

  background: rgba(255, 255, 255, 0.95);

  cursor: pointer;

  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.65);

  z-index: 5;
}

  /* ================================
     TEAM NAME
     ================================ */

.teamName {
  overflow: hidden;

  color: #fff;

  font-family: Arial, sans-serif;
  font-size: 0.95rem;
  font-weight: 800;

  line-height: 1.1;

  white-space: nowrap;
  text-overflow: ellipsis;

  text-shadow:
    1px 2px 3px rgba(0, 0, 0, 0.8);
}

  /* ================================
     SCORE
     ================================ */

.score {
  min-width: 70px;
  padding-right: 12px;

  color: #fff;

  font-family: Arial, sans-serif;
  font-size: 1rem;
  font-weight: 900;

  text-align: right;

  text-shadow:
    1px 2px 3px rgba(0, 0, 0, 0.8);
}

  /* ================================
     TOP 3
     ================================ */



  /* ================================
     MOBILE
     ================================ */

@media (max-width: 700px) {
  .powerRankings {
    padding-left: 6px;
    padding-right: 6px;
  }

  .rankingGrid {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .rankingCard {
    min-height: 62px;

    grid-template-columns:
      46px
      50px
      minmax(0, 1fr)
      62px;
  }

  .avatar {
    width: 46px;
    height: 46px;
  }

  .rankNumber {
    font-size: 1.35rem;
  }

  .teamName {
    font-size: 0.84rem;
  }

  .score {
    min-width: 62px;
    padding-right: 8px;
    font-size: 0.85rem;
  }
}
</style>

{#if validGraph && !seasonOver}
  <section class="powerRankings">

    <div class="rankingHeader">
      <h2 class="rankingTitle">MFFL Power Rankings</h2>

      <div class="rankingSubtitle">
        {leagueData.season} Season • Week {nflState.week || 1}
      </div>
    </div>

    <div class="rankingGrid">

      <!-- #1–#8 -->
      <div class="rankingColumn">
        {#each rankings.slice(0, 8) as team}
          <div
            class="rankingCard"
            style="--teamColor: var({team.color});"
          >
            <div
              class="rankNumber"
              class:topThree={team.rank <= 3}
            >
              #{team.rank}
            </div>

            <img
              class="avatar"
              src={getAvatarFromTeamManagers(
                leagueTeamManagers,
                team.rosterID,
                leagueData.season
              )}
              alt="Team avatar"
              on:click={() =>
                gotoManager({
                  year: leagueData.season,
                  leagueTeamManagers,
                  rosterID: parseInt(team.rosterID)
                })
              }
            />

            <div
              class="teamInfo"
              on:click={() =>
                gotoManager({
                  year: leagueData.season,
                  leagueTeamManagers,
                  rosterID: parseInt(team.rosterID)
                })
              }
            >
              <div class="teamName">
                {team.manager?.name || 'Unknown Team'}
              </div>

              <div class="movement">
                {team.movement}
              </div>
            </div>

            <div class="score">
              {team.powerScore}
            </div>
          </div>
        {/each}
      </div>

      <!-- #9–#16 -->
      <div class="rankingColumn">
        {#each rankings.slice(8, 16) as team}
          <div
            class="rankingCard"
            style="--teamColor: var({team.color});"
          >
            <div
              class="rankNumber"
              class:topThree={team.rank <= 3}
            >
              #{team.rank}
            </div>

            <img
              class="avatar"
              src={getAvatarFromTeamManagers(
                leagueTeamManagers,
                team.rosterID,
                leagueData.season
              )}
              alt="Team avatar"
              on:click={() =>
                gotoManager({
                  year: leagueData.season,
                  leagueTeamManagers,
                  rosterID: parseInt(team.rosterID)
                })
              }
            />

            <div
              class="teamInfo"
              on:click={() =>
                gotoManager({
                  year: leagueData.season,
                  leagueTeamManagers,
                  rosterID: parseInt(team.rosterID)
                })
              }
            >
              <div class="teamName">
                {team.manager?.name || 'Unknown Team'}
              </div>

              <div class="movement">
                {team.movement}
              </div>
            </div>

            <div class="score">
              {team.powerScore}
            </div>
          </div>
        {/each}
      </div>

    </div>
  </section>
{/if}
