<script>
  import { getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
  import { Row, Cell } from '@smui/data-table';

  export let draftRow, draftType, row, reversalRound, previous = false, players, year, leagueTeamManagers;

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

  /* === First-round mock image thumbnail === */
  .mockDraftImg {
    position: absolute;
    left: 40%;
    top: 44%;
    transform: translate(-50%, -50%);
    width: 70%;           /* tweak 50–75% as you like */
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
        <!-- First-round mock draft overlay (Upcoming only) -->
        {#if !previous && row === 1}
          <img
            class="mockDraftImg"
            src={firstRoundImg(col)}
            alt="Mock draft pick"
            on:error={(e) => (e.currentTarget.style.display = 'none')}
          />
        {/if}

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
