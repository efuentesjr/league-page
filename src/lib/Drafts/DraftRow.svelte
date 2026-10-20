<script>
  import { getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
  import { Row, Cell } from '@smui/data-table';

  export let draftRow, draftType, row, reversalRound, previous = false, players, year, leagueTeamManagers, prospects = null;

  // Pick number within the round, matching the label shown in the square
  const pickInRound = (col) => {
    const n = draftRow.length;
    if (draftType == 'snake' && !reversalRound) return row % 2 == 0 ? n - col : col + 1;
    if (draftType == 'snake' && reversalRound) {
      return (row < reversalRound && row % 2 == 0) || (row >= reversalRound && row % 2 == 1) ? n - col : col + 1;
    }
    return !reversalRound || row < reversalRound ? col + 1 : n - col;
  };

  // Projected rookie for this square (overall pick N gets player N)
  const prospectFor = (col) => prospects?.[(row - 1) * draftRow.length + pickInRound(col) - 1] || null;

  // Build path like /mockdraft/1.01.png, /mockdraft/1.16.png
  const firstRoundImg = (colIndex) => {
    const n = (colIndex + 1).toString().padStart(2, '0');
    return `/mockdraft/1.${n}.png`;
  };

  // Avoid template strings inside the style attribute by using a helper
  const playerBgStyle = (col) => {
    const id = col.player;
    if (!id) return '';
    if (players[id]?.pos === 'DEF') {
      return `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${String(id).toLowerCase()}.png)`;
    }
    return `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${id}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
  };
</script>

<style>
  :global(.draftCell) {
    position: relative;
    overflow: hidden;
  }

  :global(.changedHands) {
    background-color: var(--draftSwapped);
  }

  .draftPos {
    position: absolute;
    top: 0.3em;
    left: 0.3em;
    font-style: italic;
    color: rgba(255,255,255,.7);
    z-index: 2;
  }

  .draftPosPrev {
    position: absolute;
    top: 0.1em;
    left: 0.1em;
    font-style: italic;
    color: rgba(255,255,255,.7);
    z-index: 2;
  }

  .newOwner {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 3px;
    text-align: center;
    white-space: break-spaces;
    line-height: 1.2em;
    color: #fff;              /* switched from #444 to white */
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0,0,0,.65);
    z-index: 2;
  }

  /* Previous-draft color classes (unchanged) */
  :global(.prevQB) { background-color: var(--QBfade); }
  :global(.prevWR) { background-color: var(--WRfade); }
  :global(.prevRB) { background-color: var(--RBfade); }
  :global(.prevTE) { background-color: var(--TEfade); }
  :global(.prevK)  { background-color: var(--Kfade); }
  :global(.prevDEF){ background-color: var(--DEfadeFfade); }
  :global(.prevCB) { background-color: var(--CBfade); }
  :global(.prevSS) { background-color: var(--SSfade); }
  :global(.prevFS) { background-color: var(--FSfade); }
  :global(.prevDE) { background-color: var(--DEfade); }
  :global(.prevDL) { background-color: var(--DLfade); }
  :global(.prevLB) { background-color: var(--LBfade); }

  .playerAvatar {
    display: inline-block;
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 45%;
    height: 25px;
    width: 25px;
    background-position: center;
    border-radius: 100%;
    background-repeat: no-repeat;
    background-size: auto 25px;
  }

  .name {
    display: block;
    width: 100%;
    text-align: center;
    position: absolute;
    left: 0;
    white-space: break-spaces;
    line-height: 1em;
    bottom: 0.5em;
    color: rgba(0, 0, 0, 0.87);
  }

  /* === Projected rookie in upcoming squares === */
  .prospect {
    position: absolute;
    left: 0;
    right: 0;
    top: 1.9em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-align: center;
    line-height: 1.05em;
    z-index: 2;
    padding: 0 3px;
  }

  .prospectFace {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid var(--posColor, var(--mf-ion));
    background-color: var(--mf-panel-2);
    background-position: center;
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95em;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--posColor, var(--mf-ion));
    flex-shrink: 0;
  }

  .prospectName {
    font-weight: 600;
    color: var(--mf-text);
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .prospectSub {
    font-size: 0.85em;
    color: var(--mf-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .prospectPos {
    font-weight: 700;
    color: var(--posColor, var(--mf-ion));
  }

  .prospectTBD {
    position: absolute;
    left: 0;
    right: 0;
    top: 45%;
    text-align: center;
    color: var(--mf-dim);
    opacity: 0.6;
    font-style: italic;
  }

  /* === First-round mock image thumbnail === */
  .mockDraftImg {
    position: absolute;
    left: 60%;
    top: 40%;
    transform: translate(-50%, -50%);
    width: 80%;           /* tweak 50–75% as you like */
    height: auto;
    max-height: 72%;
    object-fit: contain;
    opacity: 0.95;
    z-index: 1;
    pointer-events: none;
  }
</style>

<Row>
  {#each draftRow as draftCol, col}
    {#if !previous || draftCol}
      <Cell class="draftCell{draftCol ? ' changedHands' : ''}{previous ? ` prev${players[draftCol.player].pos}` : ''}">
        <!-- First-round mock draft overlay (Upcoming only) 
        {#if !previous && row === 1}
          <img
            class="mockDraftImg"
            src={firstRoundImg(col)}
            alt="Mock draft pick"
            on:error={(e) => (e.currentTarget.style.display = 'none')}
          />
        {/if}
        -->

        <span class="draftPos{previous ? 'Prev' : ''}">
          {#if draftType == "auction" && previous}
            ${draftCol.amount}
          {:else if draftType == "snake" && !reversalRound}
            {row}.{row % 2 == 0 ? draftRow.length - col : col + 1}
            {#if draftCol?.newOwner}
              {' '}{previous
                ? getTeamNameFromTeamManagers(leagueTeamManagers, draftCol.newOwner, year)
                : getTeamNameFromTeamManagers(leagueTeamManagers, draftCol.newOwner)
              }
            {/if}
          {:else if draftType == "snake" && reversalRound}
            {#if (row < reversalRound && row % 2 == 0) || (row >= reversalRound && row % 2 == 1)}
              {row}.{draftRow.length - col}
            {:else}
              {row}.{col + 1}
            {/if}
            {#if draftCol?.newOwner}
              {' '}{previous
                ? getTeamNameFromTeamManagers(leagueTeamManagers, draftCol.newOwner, year)
                : getTeamNameFromTeamManagers(leagueTeamManagers, draftCol.newOwner)
              }
            {/if}
          {:else}
            {#if !reversalRound || row < reversalRound}
              {row}.{col + 1}
            {:else}
              {row}.{draftRow.length - col}
            {/if}
            {#if draftCol?.newOwner}
              {' '}{previous
                ? getTeamNameFromTeamManagers(leagueTeamManagers, draftCol.newOwner, year)
                : getTeamNameFromTeamManagers(leagueTeamManagers, draftCol.newOwner)
              }
            {/if}
          {/if}
        </span>

        {#if !previous && prospects}
          {@const prospect = prospectFor(col)}
          {#if prospect}
            <div class="prospect" style="--posColor: var(--{prospect.pos})">
              <div
                class="prospectFace"
                style={prospect.sleeperID
                  ? `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${prospect.sleeperID}.jpg)`
                  : ''}
                title={prospect.name}
              >
                {#if !prospect.sleeperID}{prospect.initials}{/if}
              </div>
              <span class="prospectName">{prospect.name}</span>
              <span class="prospectSub"><span class="prospectPos">{prospect.pos}</span> · {prospect.sub}</span>
            </div>
          {:else}
            <div class="prospectTBD">TBD</div>
          {/if}
        {/if}

        {#if draftCol && !previous}
          <div class="newOwner">{getTeamNameFromTeamManagers(leagueTeamManagers, draftCol)}</div>
        {/if}

        {#if previous}
          <div
            class="playerAvatar"
            style={playerBgStyle(draftCol)}
          />
          <br />
          <div class="name">
            {`${players[draftCol.player].fn} ${players[draftCol.player].ln}`}
            {players[draftCol.player].pos == 'DEF' ? '' : ` (${players[draftCol.player].t})`}
          </div>
        {/if}
      </Cell>
    {/if}
  {/each}
</Row>
