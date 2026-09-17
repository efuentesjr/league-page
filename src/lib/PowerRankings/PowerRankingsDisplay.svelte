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
  const colors = [
    '--barChartOne',
    '--barChartTwo',
    '--barChartThree',
    '--barChartFour',
    '--barChartFive',
    '--barChartSix',
    '--barChartSeven',
    '--barChartEight',
    '--barChartNine',
    '--barChartTen',
    '--barChartEleven',
    '--barChartTwelve',
    '--barChartThirteen',
    '--barChartFourteen',
    '--barChartFifteen',
    '--barChartSixteen'
  ];

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
        color: colors[index % colors.length]
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

    color: #f0f0f0;
    font-family: Arial, sans-serif;
    font-size: 1.45rem;
    font-weight: 900;
    line-height: 1;
    text-align: left;

    text-shadow: 1px 2px 2px rgba(0, 0, 0, 0.7);
  }

  .rankNumber.topThree {
    color: #e3b45a;
  }

  /* ================================
     AVATAR
     ================================ */

  .avatar {
    width: 38px;
    height: 38px;

    object-fit: cover;
    border-radius: 50%;

    border: 2px solid var(--teamColor);
    background: #fff;

    cursor: pointer;

    box-shadow:
      0 2px 5px rgba(0, 0, 0, 0.55);
  }

  /* ================================
     TEAM NAME
     ================================ */

  .teamInfo {
    min-width: 0;
    padding: 0 8px;
    cursor: pointer;
  }

  .teamName {
    overflow: hidden;

    color: #fff;
    font-family: Arial, sans-serif;
    font-size: 0.88rem;
    font-weight: 700;

    line-height: 1.15;
    white-space: nowrap;
    text-overflow: ellipsis;

    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  }

  .movement {
    margin-top: 3px;

    color: #888;
    font-size: 0.68rem;
    font-weight: 700;
  }

  /* ================================
     SCORE
     ================================ */

  .score {
    min-width: 58px;
    padding-right: 10px;

    color: #fff;

    font-family: Arial, sans-serif;
    font-size: 0.9rem;
    font-weight: 800;

    text-align: right;

    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  /* ================================
     TOP 3
     ================================ */

  .rankingCard:nth-child(1),
  .rankingCard:nth-child(2),
  .rankingCard:nth-child(3) {
    min-height: 62px;
  }

  .rankingCard:nth-child(1) {
    background:
      linear-gradient(
        90deg,
        rgba(218, 165, 70, 0.20),
        rgba(255, 255, 255, 0.025)
      );
  }

  .rankingCard:nth-child(2) {
    background:
      linear-gradient(
        90deg,
        rgba(190, 190, 190, 0.16),
        rgba(255, 255, 255, 0.025)
      );
  }

  .rankingCard:nth-child(3) {
    background:
      linear-gradient(
        90deg,
        rgba(145, 95, 55, 0.16),
        rgba(255, 255, 255, 0.025)
      );
  }

  /* ================================
     MOBILE
     ================================ */

  @media (max-width: 700px) {
    .powerRankings {
      padding-left: 8px;
      padding-right: 8px;
    }

    .rankingGrid {
      grid-template-columns: 1fr;
      gap: 6px;
    }

    /*
     * On mobile keep all 16 teams in one ranking,
     * rather than splitting them into separate columns.
     */
    .rankingColumn {
      gap: 6px;
    }

    .rankingColumn:nth-child(2) {
      margin-top: 0;
    }

    .rankingCard {
      min-height: 54px;
      grid-template-columns: 42px 38px minmax(0, 1fr) auto;
    }

    .rankingTitle {
      font-size: 1.35rem;
    }

    .avatar {
      width: 34px;
      height: 34px;
    }

    .rankNumber {
      font-size: 1.25rem;
    }

    .teamName {
      font-size: 0.82rem;
    }

    .score {
      font-size: 0.82rem;
      min-width: 52px;
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
