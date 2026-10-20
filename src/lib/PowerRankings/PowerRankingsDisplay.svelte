<script>
  import { onMount } from 'svelte';

  import {
    getTeamFromTeamManagers,
    round,
    predictScores,
    loadPlayers,
    getNflState
  } from '$lib/utils/helper';

  import {
    getAvatarFromTeamManagers,
    gotoManager
  } from '$lib/utils/helperFunctions/universalFunctions';

  import { leagueID } from '$lib/utils/leagueInfo';

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
   * DAILY REFRESH
   * ============================================================
   *
   * Power Rankings recalculate once every 24 hours.
   *
   * The daily refresh also gets the current NFL week and
   * refreshes player projections before rebuilding rankings.
   */

  const DAILY_REFRESH = 24 * 60 * 60 * 1000;

  /*
   * ============================================================
   * MFFL TEAM COLORS
   * ============================================================
   */

  const teamColors = {
    "the people's champ": {
      primary: '#5B2A86',
      dark: '#006847'
    },

    "ceedee tds": {
      primary: '#003594',
      dark: '#001B4D'
    },

    "chosen one": {
      primary: '#6A1B9A',
      dark: '#5A0F24'
    },

    "child support": {
      primary: '#D4AF37',
      dark: '#006400'
    },

    "bay area party supplies": {
      primary: '#AA0000',
      dark: '#470000'
    },

    "brute force attack": {
      primary: '#0B162A',
      dark: '#C83803'
    },

    "slickbears": {
      primary: '#C83803',
      dark: '#0B162A'
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
      primary: '#03202F',
      dark: '#A71930'
    },

    "the comeback kid": {
      primary: '#BF5700',
      dark: '#7C2D00'
    }
  };

  /*
   * ============================================================
   * NORMALIZE TEAM NAME
   * ============================================================
   */

  function normalizeTeamName(name) {
    return (name || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9\s]/g, '')
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
   * CALCULATE RANKINGS FOR A SPECIFIC WEEK
   * ============================================================
   *
   * This allows us to calculate:
   *
   * Current Week
   *     versus
   * Previous Week
   *
   * and determine the movement arrow.
   */

  /*
   * rosterPlayerOverrides (optional):
   *   Map of rosterID -> array of player IDs.
   *   Used to rank teams with LAST week's rosters instead
   *   of today's rosters.
   */
  const calculateRankingsForWeek = (targetWeek, rosterPlayerOverrides = null) => {
    const rosterPowers = [];

    let week = Number(targetWeek);

    if (!week || week < 1) {
      week = 1;
    }

    let max = 0;

    for (const rosterID in rosters) {
      const roster = rosters[rosterID];

      const playerIDs =
        rosterPlayerOverrides?.get(String(rosterID)) ?? roster.players;

      if (!playerIDs) continue;

      const rosterPlayers = [];

      for (const rosterPlayer of playerIDs) {
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

      /*
       * Calculate projected points from this week
       * through the end of the regular season.
       */

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
     * Sort highest score to lowest score.
     */

    return rosterPowers
      .sort((a, b) => b.powerScore - a.powerScore)
      .map((team, index) => {
        const colors = getTeamColor(team);

        return {
          ...team,
          rank: index + 1,
          color: colors.primary,
          darkColor: colors.dark
        };
      });
  };

  /*
   * ============================================================
   * BUILD CURRENT RANKINGS + WEEK-TO-WEEK MOVEMENT
   * ============================================================
   */

  const buildRankings = () => {
    validGraph = false;
    seasonOver = false;

    let week = Number(nflState?.week);

    if (!week || week < 1) {
      week = 1;
    }

    const seasonEnd = 18;

    if (week >= seasonEnd) {
      seasonOver = true;
    }

    /*
     * Current week's Power Rankings.
     */

    const currentRankings =
      calculateRankingsForWeek(week);

    if (currentRankings.length > 0) {
      validGraph = true;
    }

    /*
     * Previous week's Power Rankings.
     *
     * Uses the rosters as they were BEFORE this week's
     * waivers, free-agent moves and trades (see
     * loadPreviousRosters). Until those are loaded, or in
     * week 1, every team shows "—".
     */

    let previousRankings = [];

    if (week > 1 && previousRosterPlayers && previousRostersWeek === week) {
      previousRankings =
        calculateRankingsForWeek(week - 1, previousRosterPlayers);
    }

    /*
     * Build:
     *
     * rosterID -> previous rank
     */

    const previousRanks = new Map();

    for (const team of previousRankings) {
      previousRanks.set(
        String(team.rosterID),
        team.rank
      );
    }

    /*
     * Add movement to each current team.
     */

    rankings = currentRankings.map((team) => {
      const previousRank =
        previousRanks.get(String(team.rosterID));

      let movement = '—';

      if (previousRank !== undefined) {
        const difference =
          previousRank - team.rank;

        if (difference > 0) {
          movement = `▲ ${difference}`;
        } else if (difference < 0) {
          movement = `▼ ${Math.abs(difference)}`;
        }
      }

      return {
        ...team,
        movement
      };
    });
  };

  /*
   * ============================================================
   * LAST WEEK'S ROSTERS
   * ============================================================
   *
   * Sleeper only gives us today's rosters, so we rebuild
   * last week's by undoing every completed transaction from
   * the current week (newest first):
   *   - a player ADDED to a team is taken back off it
   *   - a player DROPPED by a team is put back on it
   * This covers waivers, free agents and trades.
   */

  let previousRosterPlayers = null;
  let previousRostersWeek = null;

  const loadPreviousRosters = async () => {
    const week = Number(nflState?.week);

    if (!week || week <= 1) return;

    try {
      const res = await fetch(
        `https://api.sleeper.app/v1/league/${leagueID}/transactions/${week}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const transactions = (await res.json()) || [];

      const rosterSets = new Map();

      for (const rosterID in rosters) {
        rosterSets.set(
          String(rosterID),
          new Set(rosters[rosterID].players || [])
        );
      }

      const completed = transactions
        .filter((t) => t.status === 'complete')
        .sort((a, b) => (b.status_updated || 0) - (a.status_updated || 0));

      for (const transaction of completed) {
        for (const [playerID, rosterID] of Object.entries(transaction.adds || {})) {
          rosterSets.get(String(rosterID))?.delete(playerID);
        }

        for (const [playerID, rosterID] of Object.entries(transaction.drops || {})) {
          rosterSets.get(String(rosterID))?.add(playerID);
        }
      }

      const result = new Map();

      for (const [rosterID, playerSet] of rosterSets) {
        result.set(rosterID, [...playerSet]);
      }

      previousRosterPlayers = result;
      previousRostersWeek = week;

      buildRankings();
    } catch (error) {
      console.error(
        '[Power Rankings] Could not load last week\'s rosters:',
        error
      );
    }
  };

  /*
   * ============================================================
   * REFRESH PLAYER DATA
   * ============================================================
   */

  const refreshPlayers = async () => {
    try {
      const newPlayersInfo =
        await loadPlayers(null, true);

      players = newPlayersInfo.players;

      buildRankings();
    } catch (error) {
      console.error(
        '[Power Rankings] Player refresh failed:',
        error
      );
    }
  };

  /*
   * ============================================================
   * DAILY POWER RANKING REFRESH
   * ============================================================
   */

  const refreshDaily = async () => {
    try {
      console.log(
        '[Power Rankings] Running daily refresh...'
      );

      /*
       * Get the current NFL week.
       */

      const newNflState =
        await getNflState();

      if (newNflState) {
        nflState = newNflState;
      }

      /*
       * Refresh player projections.
       */

      const newPlayersInfo =
        await loadPlayers(null, true);

      players = newPlayersInfo.players;

      /*
       * Recalculate rankings, then reload last week's
       * rosters (the NFL week may have changed) and
       * recalculate movement.
       */

      buildRankings();
      await loadPreviousRosters();

      console.log(
        '[Power Rankings] Daily refresh complete.'
      );
    } catch (error) {
      console.error(
        '[Power Rankings] Daily refresh failed:',
        error
      );
    }
  };

  /*
   * ============================================================
   * INITIAL BUILD
   * ============================================================
   */

  buildRankings();
  loadPreviousRosters();

  /*
   * ============================================================
   * STALE PLAYER DATA
   * ============================================================
   */

  if (playersInfo.stale) {
    refreshPlayers();
  }

  /*
   * ============================================================
   * 24-HOUR TIMER
   * ============================================================
   *
   * The timer starts when this component is loaded.
   *
   * It is automatically cleaned up when the component
   * is removed from the page.
   */

  onMount(() => {
    const dailyTimer =
      setInterval(
        refreshDaily,
        DAILY_REFRESH
      );

    return () => {
      clearInterval(dailyTimer);
    };
  });
</script>

<style>
  /* ============================================================
     POWER RANKINGS — "model readout" look
     ============================================================ */

  .powerRankings {
    --void: var(--mf-bg);
    --panel: var(--mf-panel);
    --ion: var(--mf-ion);
    --plasma: var(--mf-plasma);
    --signal: var(--mf-text);
    --dim: var(--mf-dim);

    width: 100%;
    max-width: 960px;
    margin: 22px auto 0;
    padding: 26px 18px 30px;
    box-sizing: border-box;

    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    color: var(--signal);

    /* lay out by the space this panel actually gets, not the window */
    container-type: inline-size;

    background:
      linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
      linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
      radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
      var(--void);
    border: 1px solid var(--mf-line);
    border-radius: 4px;
    clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
  }

  /* HEADER */

  .rankingHeader {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin: 0 4px 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--mf-line);
  }

  .rankingTitle {
    margin: 0;
    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.02em;
    color: var(--signal);
    text-shadow: 0 0 18px var(--mf-line-strong);
  }

  .rankingSubtitle {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--dim);
    text-align: right;
  }

  .rankingSubtitle strong {
    color: var(--ion);
    font-weight: 700;
  }

  /* GRID: 1–8 down the left, 9–16 down the right */

  .rankingGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(8, auto);
    grid-auto-flow: column;
    gap: 8px 14px;
  }

  /* ROW */

  .rankingCard {
    --teamColor: #34495e;
    --teamDark: #151d24;

    position: relative;
    display: grid;
    grid-template-columns: 52px 46px minmax(0, 1fr);
    align-items: center;
    gap: 10px;

    min-height: 62px;
    padding: 0 14px 0 0;
    box-sizing: border-box;

    background:
      linear-gradient(90deg, color-mix(in srgb, var(--teamColor) 32%, transparent), transparent 55%),
      var(--panel);
    border: 1px solid var(--mf-line);

    cursor: pointer;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .rankingCard:hover,
  .rankingCard:focus-visible {
    border-color: var(--mf-line-strong);
    background-color: var(--mf-panel-2);
    outline: none;
  }

  .rankingCard:focus-visible {
    box-shadow: inset 0 0 0 2px var(--ion);
  }

  /* rank chip: angled slab in the team's color */

  .rankBox {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;

    background: linear-gradient(160deg, var(--teamColor), var(--teamDark));
    clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
    padding-right: 6px;
  }

  .rankNumber {
    font-size: 1.45rem;
    font-weight: 700;
    line-height: 1;
    color: #fff;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  }

  .movement {
    font-size: 0.62rem;
    font-weight: 700;
    line-height: 1;
    color: rgba(255, 255, 255, 0.75);
  }

  .movement.up { color: #6dffa8; }
  .movement.down { color: #ff9aa6; }

  /* logo */

  .teamLogo {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    box-sizing: border-box;
    border: 2px solid color-mix(in srgb, var(--teamColor) 70%, white);
    background: #000;
  }

  /* name + score + meter */

  .teamInfo {
    min-width: 0;
  }

  .teamLine {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }

  .teamName {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    font-size: 1rem;
    font-weight: 600;
    line-height: 1.15;
    color: var(--signal);
  }

  .score {
    flex: none;
    font-size: 1.05rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--ion);
  }

  .meter {
    position: relative;
    height: 4px;
    margin-top: 7px;
    background: color-mix(in srgb, var(--mf-dim) 22%, transparent);
    overflow: hidden;
  }

  .meter span {
    position: absolute;
    inset: 0 auto 0 0;
    width: calc(var(--score) * 1%);
    background: linear-gradient(90deg, var(--teamColor), var(--ion));
    box-shadow: 0 0 8px var(--mf-line-strong);
    animation: meterFill 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(var(--rank) * 45ms);
  }

  @keyframes meterFill {
    from { width: 0; }
  }

  /* top 3: lit edge */

  .rankingCard.topRank {
    border-color: var(--mf-line-strong);
    box-shadow: 0 0 18px var(--mf-line);
  }

  .topRank .rankNumber {
    font-size: 1.6rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .meter span {
      animation: none;
    }
  }

  /* NARROW PANEL (phones, or a narrow column next to the sidebar) */

  @container (max-width: 640px) {
    .rankingHeader {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .rankingTitle {
      font-size: 1.5rem;
    }

    .rankingSubtitle {
      text-align: left;
    }

    .rankingGrid {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: none;
      grid-auto-flow: row;
      gap: 6px;
    }

    .rankingCard {
      grid-template-columns: 44px 38px minmax(0, 1fr);
      gap: 8px;
      min-height: 54px;
      padding-right: 10px;
    }

    .teamLogo {
      width: 38px;
      height: 38px;
    }

    .rankNumber {
      font-size: 1.2rem;
    }

    .topRank .rankNumber {
      font-size: 1.3rem;
    }

    .teamName {
      font-size: 0.9rem;
    }

    .score {
      font-size: 0.95rem;
    }
  }

  @media (max-width: 700px) {
    .powerRankings {
      width: 96%;
      padding: 18px 10px 20px;
      clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    }
  }
</style>

{#if validGraph && !seasonOver}

  <section class="powerRankings" aria-label="Power rankings">

    <div class="rankingHeader">
      <h2 class="rankingTitle">MFFL Power Rankings</h2>
      <div class="rankingSubtitle">
        <strong>Week {nflState.week || 1}</strong> of the {leagueData.season} season
      </div>
    </div>

    <div class="rankingGrid">
      {#each rankings.slice(0, 16) as team (team.rosterID)}
        <div
          class="rankingCard"
          class:topRank={team.rank <= 3}
          style="--teamColor: {team.color}; --teamDark: {team.darkColor}; --score: {team.powerScore}; --rank: {team.rank};"
          role="button"
          tabindex="0"
          aria-label="#{team.rank} {team.manager?.name || 'Unknown Team'}, power score {team.powerScore}"
          on:click={() =>
            gotoManager({
              year: leagueData.season,
              leagueTeamManagers,
              rosterID: parseInt(team.rosterID)
            })}
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
          <div class="rankBox">
            <span class="rankNumber">{team.rank}</span>
            {#if team.movement !== '—'}
              <span
                class="movement"
                class:up={team.movement.startsWith('▲')}
                class:down={team.movement.startsWith('▼')}
              >
                {team.movement}
              </span>
            {/if}
          </div>

          <img
            class="teamLogo"
            src={getAvatarFromTeamManagers(leagueTeamManagers, team.rosterID, leagueData.season)}
            alt=""
          />

          <div class="teamInfo">
            <div class="teamLine">
              <span class="teamName">{team.manager?.name || 'Unknown Team'}</span>
              <span class="score">{team.powerScore}</span>
            </div>
            <div class="meter" aria-hidden="true"><span></span></div>
          </div>
        </div>
      {/each}
    </div>

  </section>

{/if}
