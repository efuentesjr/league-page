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

  /*
   * ============================================================
   * MFFL TEAM COLORS
   * ============================================================
   *
   * These are used for the ranking strips.
   * Each team has a primary and darker color.
   */

  const teamColors = {
    "the people's champ": {
      primary: '#5B0F18',
      dark: '#26070B'
    },

    "ceedee tds": {
      primary: '#003594',
      dark: '#001B4D'
    },

    "chosen one": {
      primary: '#8C1D40',
      dark: '#3F0D20'
    },

    "child support": {
      primary: '#C60C30',
      dark: '#550514'
    },

    "bay area party supplies": {
      primary: '#AA0000',
      dark: '#470000'
    },

    "brute force attack": {
      primary: '#C8102E',
      dark: '#520411'
    },

    "slickbears": {
      primary: '#B3995D',
      dark: '#4C4122'
    },

    "texastimeshifts": {
      primary: '#BF5700',
      dark: '#4C2200'
    },

    "do it to them": {
      primary: '#006847',
      dark: '#00291C'
    },

    "blue ballers": {
      primary: '#003DA5',
      dark: '#001A49'
    },

    "remember the raiders": {
      primary: '#6D7378',
      dark: '#292C2F'
    },

    "dem boyz": {
      primary: '#041E42',
      dark: '#010C1B'
    },

    "demoboyz": {
      primary: '#041E42',
      dark: '#010C1B'
    },

    "vick2times": {
      primary: '#FB4F14',
      dark: '#642008'
    },

    "blue tent all-stars": {
      primary: '#0085CA',
      dark: '#00364F'
    },

    "loud and stroud": {
      primary: '#0085CA',
      dark: '#00364F'
    },

    "the comeback kid": {
      primary: '#AA0000',
      dark: '#470000'
    }
  };

  /*
   * Normalize names so small capitalization differences
   * don't prevent the team color from being found.
   */
  function normalizeTeamName(name) {
    return (name || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getTeamColor(team) {
    const name = normalizeTeamName(team?.manager?.name);

    return (
      teamColors[name] || {
        primary: '#34495E',
        dark: '#151D24'
      }
    );
  }

  /*
   * ============================================================
   * BUILD POWER RANKINGS
   * ============================================================
   *
   * The actual power-ranking calculation remains the same:
   * future projected scores are calculated, then normalized
   * against the highest scoring roster.
   */

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

    /*
     * Normalize the highest team to 100.
     */
    for (const rosterPower of rosterPowers) {
      rosterPower.powerScore =
        max > 0
          ? round((rosterPower.powerScore / max) * 100)
          : 0;
    }

    /*
     * Sort highest score to lowest score and assign rank.
     */
    rankings = rosterPowers
      .sort((a, b) => b.powerScore - a.powerScore)
      .map((team, index) => {
        const colors = getTeamColor(team);

        return {
          ...team,
          rank: index + 1,
          movement: '—',
          color: colors.primary,
          darkColor: colors.dark
        };
      });
  };

  buildRankings();

  /*
   * ============================================================
   * REFRESH PLAYERS
   * ============================================================
   */

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
  /* ============================================================
     MAIN CONTAINER
     ============================================================ */

  .powerRankings {
    width: 100%;
    max-width: 1000px;
    margin: 22px auto 0;
    padding: 0 10px 30px;
    box-sizing: border-box;
  }

  /* ============================================================
     HEADER
     ============================================================ */

  .rankingHeader {
    text-align: center;
    margin-bottom: 16px;
  }

  .rankingTitle {
    margin: 0;

    color: #d9a441;

    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.8rem;
    font-weight: 900;

    letter-spacing: 1.5px;
    line-height: 1.1;

    text-transform: uppercase;

    text-shadow:
      0 2px 3px rgba(0, 0, 0, 0.7);
  }

  .rankingSubtitle {
    margin-top: 5px;

    color: #aaa;

    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.78rem;
    font-weight: 700;

    letter-spacing: 1.2px;

    text-transform: uppercase;
  }

  /* ============================================================
     TWO COLUMN LAYOUT
     ============================================================ */

.rankingGrid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 9px 12px;

  width: 100%;
  align-items: stretch;
}

.rankingColumn {
  display: flex;
  flex-direction: column;
  gap: 7px;

  min-width: 0;
  width: 100%;
}

.rankingCard {
  width: 100%;
  box-sizing: border-box;
}

  /* ============================================================
     RANKING ROW
     ============================================================ */

  .rankingCard {
    --teamColor: #34495e;
    --teamDark: #151d24;

    position: relative;

    display: grid;

    /*
     * Rank | Team | Score | Logo
     */
    grid-template-columns:
      54px
      minmax(0, 1fr)
      62px
      78px;

    align-items: center;

    height: 66px;
    min-height: 66px;

    overflow: hidden;

    background:
      linear-gradient(
        90deg,
        var(--teamColor) 0%,
        var(--teamColor) 42%,
        var(--teamDark) 100%
      );

    border: 1px solid rgba(255, 255, 255, 0.16);

    box-shadow:
      0 3px 7px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);

    box-sizing: border-box;

    cursor: pointer;

    transition:
      transform 0.15s ease,
      filter 0.15s ease;
  }

  .rankingCard:hover {
    transform: translateX(3px);
    filter: brightness(1.08);
  }

  /* ============================================================
     RANK BOX
     ============================================================ */

  .rankBox {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    height: 100%;

    background:
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.18),
        rgba(0, 0, 0, 0.22)
      );

    border-right:
      1px solid rgba(255, 255, 255, 0.20);

    box-sizing: border-box;

    z-index: 2;
  }

  .rankNumber {
    color: #fff;

    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.55rem;
    font-weight: 900;

    line-height: 1;

    text-shadow:
      1px 2px 3px rgba(0, 0, 0, 0.85);
  }

  /* ============================================================
     TEAM INFORMATION
     ============================================================ */

  .teamInfo {
    min-width: 0;

    padding-left: 12px;
    padding-right: 4px;

    z-index: 3;

    box-sizing: border-box;
  }

  .teamName {
    overflow: hidden;

    color: #fff;

    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.92rem;
    font-weight: 900;

    line-height: 1.1;

    white-space: nowrap;
    text-overflow: ellipsis;

    text-shadow:
      1px 2px 3px rgba(0, 0, 0, 0.9);
  }

  .movement {
    margin-top: 3px;

    color: rgba(255, 255, 255, 0.70);

    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.65rem;
    font-weight: 700;

    line-height: 1;
  }

  /* ============================================================
     SCORE
     ============================================================ */

  .score {
    position: relative;

    color: #fff;

    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.95rem;
    font-weight: 900;

    line-height: 1;

    text-align: right;

    padding-right: 8px;

    text-shadow:
      1px 2px 3px rgba(0, 0, 0, 0.9);

    z-index: 4;
  }

  /* ============================================================
     LARGE TEAM LOGO
     ============================================================ */

  .teamLogo {
    position: absolute;

    right: -2px;
    top: 50%;

    width: 76px;
    height: 76px;

    transform: translateY(-50%);

    object-fit: contain;

    /*
     * Important:
     * No circular crop.
     * No white background.
     * No border.
     *
     * This allows the logo to visually extend
     * toward/over the edge like the NFL graphic.
     */
    border: none;
    border-radius: 0;

    background: transparent;

    filter:
      drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.75));

    z-index: 5;

    pointer-events: none;
  }

  /*
   * Slight dark fade behind the logo so it remains readable.
   */
  .logoFade {
    position: absolute;

    right: 0;
    top: 0;

    width: 105px;
    height: 100%;

    background:
      linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 0, 0, 0.05) 30%,
        rgba(0, 0, 0, 0.38) 100%
      );

    pointer-events: none;

    z-index: 1;
  }

  /* ============================================================
     TOP 3
     ============================================================ */

  .rankingCard.topRank {
    height: 70px;
    min-height: 70px;

    border-color:
      rgba(255, 255, 255, 0.28);

    box-shadow:
      0 4px 9px rgba(0, 0, 0, 0.50),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }

  .topRank .rankNumber {
    font-size: 1.7rem;
  }

  .topRank .teamLogo {
    width: 82px;
    height: 82px;
  }

  /* ============================================================
     MOBILE
     ============================================================ */

  @media (max-width: 700px) {
    .powerRankings {
      margin-top: 15px;
      padding-left: 6px;
      padding-right: 6px;
    }

    .rankingTitle {
      font-size: 1.4rem;
      letter-spacing: 1px;
    }

    .rankingSubtitle {
      font-size: 0.7rem;
    }

    /*
     * One column on phones.
     */
    .rankingGrid {
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .rankingColumn {
      gap: 6px;
    }

    .rankingCard {
      grid-template-columns:
        48px
        minmax(0, 1fr)
        58px
        68px;

      height: 60px;
      min-height: 60px;
    }

    .rankingCard.topRank {
      height: 64px;
      min-height: 64px;
    }

    .rankNumber {
      font-size: 1.3rem;
    }

    .topRank .rankNumber {
      font-size: 1.45rem;
    }

    .teamInfo {
      padding-left: 9px;
    }

    .teamName {
      font-size: 0.82rem;
    }

    .movement {
      font-size: 0.58rem;
    }

    .score {
      font-size: 0.82rem;
      padding-right: 5px;
    }

    .teamLogo {
      width: 68px;
      height: 68px;
      right: -2px;
    }

    .topRank .teamLogo {
      width: 74px;
      height: 74px;
    }

    .logoFade {
      width: 90px;
    }
  }

  /* ============================================================
     VERY SMALL PHONES
     ============================================================ */

  @media (max-width: 380px) {
    .rankingCard {
      grid-template-columns:
        42px
        minmax(0, 1fr)
        54px
        58px;
    }

    .rankNumber {
      font-size: 1.15rem;
    }

    .teamName {
      font-size: 0.75rem;
    }

    .score {
      font-size: 0.75rem;
    }

    .teamLogo {
      width: 60px;
      height: 60px;
    }
  }

  /* ============================================================
     REDUCED MOTION
     ============================================================ */

  @media (prefers-reduced-motion: reduce) {
    .rankingCard {
      transition: none;
    }
  }
</style>

{#if validGraph && !seasonOver}
  <section class="powerRankings">

    <!-- HEADER -->
    <div class="rankingHeader">
      <h2 class="rankingTitle">
        MFFL Power Rankings
      </h2>

      <div class="rankingSubtitle">
        {leagueData.season} Season • Week {nflState.week || 1}
      </div>
    </div>

    <!-- RANKINGS -->
    <div class="rankingGrid">

      <!-- =====================================================
           #1–#8
           ===================================================== -->

      <div class="rankingColumn">

        {#each rankings.slice(0, 8) as team}

          <div
            class:topRank={team.rank <= 3}
            class="rankingCard"
            style="
              --teamColor: {team.color};
              --teamDark: {team.darkColor};
            "
            role="button"
            tabindex="0"
            on:click={() =>
              gotoManager({
                year: leagueData.season,
                leagueTeamManagers,
                rosterID: parseInt(team.rosterID)
              })
            }
            on:keydown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();

                gotoManager({
                  year: leagueData.season,
                  leagueTeamManagers,
                  rosterID: parseInt(team.rosterID)
                });
              }
            }}
          >

            <!-- RANK -->
            <div class="rankBox">
              <span class="rankNumber">
                #{team.rank}
              </span>
            </div>

            <!-- TEAM NAME -->
            <div class="teamInfo">
              <div class="teamName">
                {team.manager?.name || 'Unknown Team'}
              </div>

              <div class="movement">
                {team.movement}
              </div>
            </div>

            <!-- SCORE -->
            <div class="score">
              {team.powerScore}
            </div>

            <!-- LOGO BACKGROUND -->
            <div class="logoFade"></div>

            <!-- TEAM LOGO -->
            <img
              class="teamLogo"
              src={getAvatarFromTeamManagers(
                leagueTeamManagers,
                team.rosterID,
                leagueData.season
              )}
              alt=""
            />

          </div>

        {/each}

      </div>


      <!-- =====================================================
           #9–#16
           ===================================================== -->

      <div class="rankingColumn">

        {#each rankings.slice(8, 16) as team}

          <div
            class:topRank={team.rank <= 3}
            class="rankingCard"
            style="
              --teamColor: {team.color};
              --teamDark: {team.darkColor};
            "
            role="button"
            tabindex="0"
            on:click={() =>
              gotoManager({
                year: leagueData.season,
                leagueTeamManagers,
                rosterID: parseInt(team.rosterID)
              })
            }
            on:keydown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();

                gotoManager({
                  year: leagueData.season,
                  leagueTeamManagers,
                  rosterID: parseInt(team.rosterID)
                });
              }
            }}
          >

            <!-- RANK -->
            <div class="rankBox">
              <span class="rankNumber">
                #{team.rank}
              </span>
            </div>

            <!-- TEAM NAME -->
            <div class="teamInfo">
              <div class="teamName">
                {team.manager?.name || 'Unknown Team'}
              </div>

              <div class="movement">
                {team.movement}
              </div>
            </div>

            <!-- SCORE -->
            <div class="score">
              {team.powerScore}
            </div>

            <!-- LOGO BACKGROUND -->
            <div class="logoFade"></div>

            <!-- TEAM LOGO -->
            <img
              class="teamLogo"
              src={getAvatarFromTeamManagers(
                leagueTeamManagers,
                team.rosterID,
                leagueData.season
              )}
              alt=""
            />

          </div>

        {/each}

      </div>

    </div>

  </section>
{/if}
