<script>
  import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers, gotoManager, round } from "./utils/helperFunctions/universalFunctions";

  export let leagueTeamManagers, stat, label, xMin, xMax, secondStat, managerID, rosterID, color, year;

  $: user = managerID ? leagueTeamManagers.users[managerID] : null;

  // width percentage helper (unchanged logic)
  const pct = (val) => {
    const span = (xMax - xMin) === 0 ? 1 : (xMax - xMin);
    return Math.max(0, Math.min(100, ((val - xMin) / span) * 100));
  };
</script>

<style>
  :global(.opacity) { opacity: 0.30; }

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
    border: 2px solid;
    z-index: 14;
    background-color: #fff;
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

  .statBars {
    display: flex;
    margin: 0 auto;
  }

  .leftSpacer { width: 40px; height: 1px; display: inline-block; }
  .rightSpacer { width: 20px; height: 1px; display: inline-block; }

  .bars {
    flex-grow: 2;
    position: relative;
  }

  /* ===== 3D ANGLED BAR STYLE =====
     - squared edges (no border-radius)
     - skewed block with top & side faces
     - label is unskewed so it stays readable
  */
  .bar,
  .secondBar {
    position: relative;
    height: 1.8em;
    border-radius: 0;                 /* squared edges */
    transform: skewX(-12deg);         /* the angle */
    box-shadow:
      6px 6px 12px rgba(0,0,0,0.35),  /* depth */
      inset -3px -3px 6px rgba(255,255,255,0.12), /* highlight */
      inset 3px 3px 6px rgba(0,0,0,0.30);         /* inner shade */
    z-index: 10;
    overflow: visible;
  }

  /* top face */
  .bar::before,
  .secondBar::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: -8px;
    height: 8px;
    transform: skewX(12deg); /* counter the parent skew so the face sits flat */
    background: rgba(255,255,255,0.10);  /* subtle highlight strip */
    pointer-events: none;
  }

  /* side face (at the right edge) */
  .bar::after,
  .secondBar::after {
    content: "";
    position: absolute;
    top: 0;
    right: -10px;    /* “thickness” of the side */
    width: 10px;
    height: 100%;
    transform: skewY(-15deg);         /* gives that blocky side look */
    background: rgba(0,0,0,0.28);     /* subtle darker side */
    filter: saturate(0.9) brightness(0.9);
    pointer-events: none;
  }

  /* “unskew” the content (text) so it isn't slanted */
  .barInner {
    transform: skewX(12deg);
    height: 100%;
    display: flex;
    align-items: center;
  }

  .barLabel {
    z-index: 12;
    vertical-align: text-top;
    margin-left: 40px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.45);
  }

  /* stacked second stat bar sits on top */
  .secondBar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 11;
  }

  .clickable { cursor: pointer; }

  @media (max-width: 600px) {
    .barParent { height: 57px; }
    .managerName { left: 60px; font-size: 0.8em; }
    .teamAvatar { left: 10px; height: 30px; }
    .barLabel { margin-left: 30px; font-size: 0.82em; }
    .leftSpacer { width: 30px; }
    .rightSpacer { width: 10px; }
    .bar, .secondBar { height: 1.2em; }
    .vCenter { height: 1.2em; }
    .bar::before, .secondBar::before { top: -6px; height: 6px; }
    .bar::after, .secondBar::after { right: -8px; width: 8px; }
  }
</style>

<div class="barParent">
  <img
    alt="team avatar"
    on:click={() => gotoManager({year, leagueTeamManagers, managerID, rosterID})}
    style="border-color: var({color});"
    class="teamAvatar clickable"
    src="{user ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : getAvatarFromTeamManagers(leagueTeamManagers, rosterID, year)}"
  />

  <span
    class="managerName clickable"
    on:click={() => gotoManager({year, leagueTeamManagers, managerID, rosterID})}
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
        <!-- MAIN BAR (skewed, 3D) -->
        <div
          class="bar{!secondStat ? '' : ' opacity'}"
          style="background: var({color}); width: {pct(stat)}%;"
        >
          <div class="barInner">
            {#if !secondStat}
              <span class="barLabel">{stat}{label}</span>
            {/if}
          </div>
        </div>

        <!-- OPTIONAL SECOND BAR (stacked overlay, also skewed) -->
        {#if secondStat}
          <div
            class="bar secondBar"
            style="background: var({color}); width: {pct(secondStat)}%;"
          >
            <div class="barInner">
              <span class="barLabel">
                {secondStat}&nbsp;&nbsp;of&nbsp;&nbsp;{stat}&nbsp;&nbsp;({round(secondStat/stat*100)}%)
              </span>
            </div>
          </div>
        {/if}
      </div>
      <div class="rightSpacer" />
    </div>
  </div>
</div>
