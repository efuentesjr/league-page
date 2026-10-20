<script>
  import {
    getAvatarFromTeamManagers,
    getTeamNameFromTeamManagers,
    gotoManager,
    round
  } from "./utils/helperFunctions/universalFunctions";
  import { getLogoColor } from "./utils/logoColor";

  // color is kept for compatibility; rows now use the home-page palette
  export let leagueTeamManagers, stat, label, xMin, xMax, secondStat, managerID, rosterID, color = null, year, rank = null;

  $: user = managerID ? leagueTeamManagers.users[managerID] : null;
  $: name = user ? user.display_name : rosterID ? getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, year) : '';
  $: avatar = user ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : getAvatarFromTeamManagers(leagueTeamManagers, rosterID, year);

  // whole numbers stay whole; anything with decimals shows exactly two
  const fmt = (val) => {
    const n = Number(val);
    if (!isFinite(n)) return val;
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  };
  const fmt2 = (val) => {
    const n = Number(val);
    return isFinite(n) ? n.toFixed(2) : val;
  };

  const pct = (val) => {
    const span = (xMax - xMin) === 0 ? 1 : (xMax - xMin);
    return Math.max(2, Math.min(100, ((val - xMin) / span) * 100));
  };

  const go = () => gotoManager({year, leagueTeamManagers, managerID, rosterID});

  // team color pulled from its logo (falls back to the site accent)
  let logoColor = null;
  $: getLogoColor(avatar).then((c) => (logoColor = c));
  $: teamStyle = logoColor ? `--chipA: ${logoColor}; --chipB: color-mix(in srgb, ${logoColor} 35%, #000);` : '';

  $: medal = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
</script>

<style>
  .card {
    --chipA: color-mix(in srgb, var(--mf-plasma) 75%, var(--mf-panel));
    --chipB: color-mix(in srgb, var(--mf-plasma) 25%, #000);
    position: relative;
    display: grid;
    grid-template-columns: 46px 42px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    min-height: 58px;
    padding: 0 14px 0 0;
    box-sizing: border-box;
    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--chipA) 24%, transparent), transparent 55%),
      var(--mf-panel);
    border: 1px solid var(--mf-line);
    cursor: pointer;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .card:hover,
  .card:focus-visible {
    border-color: var(--mf-line-strong);
    background-color: var(--mf-panel-2);
    outline: none;
  }

  .card:focus-visible {
    box-shadow: inset 0 0 0 2px var(--mf-ion);
  }

  /* top three keep medal colors on the rank tab; the rest of the card wears the team color */
  .gold   { --medalA: #e5b52a; --medalB: #6b4d06; }
  .silver { --medalA: #c9d3e0; --medalB: #4a5566; }
  .bronze { --medalA: #d08a4e; --medalB: #5c3216; }

  .card.gold,
  .card.silver,
  .card.bronze {
    border-color: var(--mf-line-strong);
    box-shadow: 0 0 16px var(--mf-line);
  }

  /* rank chip: angled slab, same shape as the home page */
  .rankBox {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 6px;
    background: linear-gradient(160deg, var(--medalA, var(--chipA)), var(--medalB, var(--chipB)));
    clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    box-sizing: border-box;
    border: 2px solid color-mix(in srgb, var(--chipA) 70%, white);
    background: #000;
  }

  .info {
    min-width: 0;
  }

  .line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }

  .name {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.98rem;
    font-weight: 600;
    line-height: 1.15;
    color: var(--mf-text);
  }

  .value {
    flex: none;
    font-size: 1.02rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--mf-ion);
  }

  .value small {
    font-size: 0.72em;
    font-weight: 500;
    color: var(--mf-dim);
  }

  .meter {
    position: relative;
    height: 5px;
    margin-top: 7px;
    background: color-mix(in srgb, var(--mf-dim) 22%, transparent);
    overflow: hidden;
  }

  .meter span {
    position: absolute;
    inset: 0 auto 0 0;
    background: linear-gradient(90deg, var(--chipA), var(--mf-ion));
    box-shadow: 0 0 8px var(--mf-line-strong);
    animation: meterFill 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(var(--rank, 1) * 35ms);
  }

  /* potential points: faint full bar behind the actual bar */
  .meter span.ghost {
    background: color-mix(in srgb, var(--mf-ion) 28%, transparent);
    box-shadow: none;
  }

  .sub {
    margin-top: 4px;
    font-size: 0.7rem;
    color: var(--mf-dim);
    font-variant-numeric: tabular-nums;
  }

  @keyframes meterFill {
    from { width: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .meter span { animation: none; }
  }

  @media (max-width: 420px) {
    .card {
      grid-template-columns: 38px 34px minmax(0, 1fr);
      gap: 8px;
      min-height: 52px;
      padding-right: 10px;
    }
    .rankBox { font-size: 1.05rem; }
    .avatar { width: 34px; height: 34px; }
    .name { font-size: 0.88rem; }
    .value { font-size: 0.9rem; }
  }
</style>

<div class="card {medal}" role="link" tabindex="0" style="--rank: {rank || 1}; {teamStyle}" on:click={go} on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && go()}>
  <div class="rankBox">{rank ?? ''}</div>
  <img class="avatar" alt="" src={avatar} />
  <div class="info">
    <div class="line">
      <span class="name">{name}</span>
      {#if secondStat}
        <span class="value">{round(secondStat / stat * 100)}<small>%</small></span>
      {:else}
        <span class="value">{fmt(stat)}{#if label}<small>{label}</small>{/if}</span>
      {/if}
    </div>
    <div class="meter">
      {#if secondStat}
        <span class="ghost" style="width: {pct(stat)}%"></span>
        <span style="width: {pct(secondStat)}%"></span>
      {:else}
        <span style="width: {pct(stat)}%"></span>
      {/if}
    </div>
    {#if secondStat}
      <div class="sub">{fmt2(secondStat)} of {fmt2(stat)} possible</div>
    {/if}
  </div>
</div>
