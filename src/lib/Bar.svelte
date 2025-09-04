<script>
  import {
    getAvatarFromTeamManagers,
    getTeamNameFromTeamManagers,
    gotoManager,
    round
  } from "./utils/helperFunctions/universalFunctions";

  export let leagueTeamManagers, stat, label, xMin, xMax, secondStat, managerID, rosterID, color, year;

  $: user = managerID ? leagueTeamManagers.users[managerID] : null;

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

  /* ===== Angled, squared 3D block ===== */
  .bar,
  .secondBar {
    position: relative;
    height: 1.8em;
    border-radius: 0;                     /* squared edges */
    transform: skewX(-12deg);             /* the angle */
    outline: 1px solid rgba(255,255,255,0.08); /* separation from page bg */
    box-shadow:
      6px 6px 14px var(--barEdgeShadow, rgba(0,0,0,.45)),     /* depth to page */
      inset 3px 3px 7px var(--barInnerShade, rgba(0,0,0,.35)),/* inner shade */
      inset -3px -3px 7px var(--barTopHighlight, rgba(255,255,255,.22)); /* edge light */
    z-index: 10;
    overflow: visible;
    /* gentle light sweep + your fill */
    background-image:
      linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0) 35%),
      var(--barFill, transparent);
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  /* top face highlight */
  .bar::before,
  .secondBar::before {
    content: "";
    position: absolute;
    left: 0; right: 0;
    top: -8px; height: 8px;
    transform: skewX(12deg); /* counter the parent skew */
    background: var(--barTopHighlight, rgba(255,255,255,0.18));
    pointer-events: none;
  }

  /* right side face */
  .bar::after,
  .secondBar::after {
    content: "";
    position: absolute;
    top: 0; right: -10px;
    width: 10px; height: 100%;
    transform: skewY(-15deg);
    background: rgba(0,0,0,0.35);
    pointer-events: none;
  }

  /* unskew content so text is readable */
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
    color: var(--barText, #fff);
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }

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
        <!-- MAIN BAR -->
        <div
          class="bar{!secondStat ? '' : ' opacity'}"
          style="--barFill: var({color}); background: var(--barFill); width: {pct(stat)}%;"
        >
          <div class="barInner">
            {#if !secondStat}
              <span class="barLabel">{stat}{label}</span>
														 
																			 
						  
            {/if}
          </div>
									   
        </div>

        <!-- OPTIONAL SECOND BAR (overlay) -->
        {#if secondStat}
          <div
            class="bar secondBar"
            style="--barFill: var({color}); background: var(--barFill); width: {pct(secondStat)}%;"
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
