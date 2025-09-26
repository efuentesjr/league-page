<script>
  import { getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
  import { Row, Cell } from '@smui/data-table';

  export let draftRow, draftType, row, reversalRound, previous = false, players, year, leagueTeamManagers;

  // Build path like /mockdraft/1.01.png, /mockdraft/1.16.png
  const firstRoundImg = (colIndex) => {
    const n = (colIndex + 1).toString().padStart(2, '0');
    return `/mockdraft/1.${n}.png`;
  };
</script>

<style>
  :global(.draftCell) {
    position: relative;
    overflow: hidden; /* make sure background image doesn’t spill */
  }

  :global(.changedHands) {
    background-color: var(--draftSwapped);
  }

  .draftPos {
    position: absolute;
    top: 0.3em;
    left: 0.3em;
    font-style: italic;
    color: #aaa;
    z-index: 2;
  }

  .draftPosPrev {
    position: absolute;
    top: 0.1em;
    left: 0.1em;
    font-style: italic;
    color: #444;
    z-index: 2;
  }

  .newOwner {
    font-style: italic;
    color: #444;
    text-align: center;
    white-space: break-spaces;
    line-height: 1.2em;
    z-index: 2;
    position: relative;
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

.mockDraftImg {
  position: relative;   /* no longer absolute */
  display: block;
  margin: 0 auto;       /* center horizontally */
  max-width: 60%;       /* shrink image size */
  max-height: 60%;      /* shrink vertically */
  object-fit: contain;
  opacity: 0.9;         /* still slightly faded */
  z-index: 1;
}


  /* Optional subtle gradient for text readability */
  .mockDraftShade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 100%);
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
            style="{players[draftCol.player].pos == 'DEF'
              ? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${draftCol.player.toLowerCase()}.png)`
              : `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${draftCol.player}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`}"
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
