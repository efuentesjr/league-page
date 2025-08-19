<script>
  import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers, gotoManager, round } from "./utils/helperFunctions/universalFunctions";

  export let leagueTeamManagers, stat, label, xMin, xMax, secondStat, managerID, rosterID, color, year;

  $: user = managerID ? leagueTeamManagers.users[managerID] : null;
</script>

<style>
  :global(.opacity) {
    opacity: 0.3;
  }

  .barParent {
    position: relative;
    margin-bottom: -10px;
    height: 76px;
  }

  .managerName {
    position: absolute;
    top: 0;
    left: 80px;
  }

  .teamAvatar {
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    height: 40px;
    margin: auto;
    border-radius: 50%;
    border: 2px solid; /* gradient ring via border-image inline */
    z-index: 14;
    background-color: #fff;
  }

  .statBars {
    display: flex;
    margin: 0 auto;
  }

  .leftSpacer {
    width: 40px;
    height: 1px;
    display: inline-block;
  }

  .rightSpacer {
    width: 20px;
    height: 1px;
    display: inline-block;
  }

  .bars {
    flex-grow: 2;
    position: relative;
  }

  .bar {
    height: 1.8em;
    border-radius: 0 0.9em 0.9em 0;
    z-index: 10;

    /* Make gradients render correctly */
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  .secondBar {
    position: absolute;
    top: 0;
    z-index: 11;
    left: 0;
  }

  .barLabel {
    z-index: 12;
    vertical-align: text-top;
    margin-left: 40px;
  }

  .vCenter {
    display: block;
    height: 1.8em;
    position: absolute;
    width: 100%;
    top: 0;
    bottom: 0;
    margin: auto 0;
  }

  .clickable {
    cursor: pointer;
  }

  @media (max-width: 600px) {
    .barParent {
      height: 57px;
    }
    .managerName {
      left: 60px;
      font-size: 0.8em;
    }
    .teamAvatar {
      left: 10px;
      height: 30px;
    }
    .barLabel {
      margin-left: 30px;
      vertical-align: middle;
      font-size: 0.8em;
    }
    .leftSpacer {
      width: 30px;
    }
    .rightSpacer {
      width: 10px;
    }
    .bar {
      height: 1.2em;
      border-radius: 0 0.6em 0.6em 0;
    }
    .vCenter {
      height: 1.2em;
    }
  }
</style>

<div class="barParent">
  <!-- Gradient ring via border-image; add explicit slice -->
  <img
    alt="team avatar"
    on:click={() => gotoManager({ year, leagueTeamManagers, managerID, rosterID })}
    style="border: 2px solid transparent; border-image: var({color}) 1; border-image-slice: 1; background-color: #fff;"
    class="teamAvatar clickable"
    src="{user ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : getAvatarFromTeamManagers(leagueTeamManagers, rosterID, year)}"
  />

  <span
    class="managerName clickable"
    on:click={() => gotoManager({ year, leagueTeamManagers, managerID, rosterID })}
  >
    {#if user}
      {user.display_name}
    {:else if rosterID}
      {getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, year)}
    {/if}
  </span>

  <div class="vCenter">
    <div class="statBars">
      <div class="leftSpacer" />
      <div class="bars">
        <!-- Primary bar: use background-image so gradients work -->
        <div
          class="bar{!secondStat ? '' : ' opacity'}"
          style="background-image: var({color}); width: {(stat - xMin) / (xMax - xMin == 0 ? 1 : (xMax - xMin)) * 100}%;"
        >
          {#if !secondStat}
            <span class="barLabel">{stat}{label}</span>
          {/if}
        </div>

        {#if secondStat}
          <!-- Secondary bar: also gradient-capable -->
          <div
            class="bar secondBar"
            style="background-image: var({color}); width: {(secondStat - xMin) / (xMax - xMin == 0 ? 1 : (xMax - xMin)) * 100}%;"
          >
            <span class="barLabel">
              {secondStat}&nbsp;&nbsp;of&nbsp;&nbsp;{stat}&nbsp;&nbsp;({round(secondStat / stat * 100)}%)
            </span>
          </div>
        {/if}
      </div>
      <div class="rightSpacer" />
    </div>
  </div>
</div>
