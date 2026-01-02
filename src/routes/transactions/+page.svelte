<script>
  import LinearProgress from '@smui/linear-progress';
  import { TransactionsPage } from '$lib/components';
  import SleeperAvatar from '$lib/components/SleeperAvatar.svelte';
  import { waitForAll, getTeamFromTeamManagers } from '$lib/utils/helper';

  export let data;
  const { show, query, page, playersData, transactionsData, leagueTeamManagersData } = data;

  const perPage = 10;
  let partnerSearch = '';

  /* ---------------- PAIR COUNTS ---------------- */
  function computePairs(transactions, leagueTeamManagers) {
    const map = new Map();

    const add = (a, b) => {
      if (!a || !b) return;

      const A = a.name.localeCompare(b.name) <= 0 ? a : b;
      const B = A === a ? b : a;
      const key = `${A.name}|||${B.name}`;

      if (!map.has(key)) {
        map.set(key, {
          teamA: A.name,
          teamB: B.name,
          slugA: A.slug,
          slugB: B.slug,
          count: 0
        });
      }
      map.get(key).count++;
    };

    for (const tx of transactions ?? []) {
      if (tx.type !== 'trade') continue;

      const season = tx.season;

      const teams = (tx.rosters ?? [])
        .map(rid => getTeamFromTeamManagers(leagueTeamManagers, season, rid))
        .filter(Boolean)
        .map(t => ({
          name: t.teamName,
          slug: t.slug
        }));

      if (teams.length < 2 || teams.length > 3) continue;

      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          add(teams[i], teams[j]);
        }
      }
    }

    return [...map.values()].sort((a, b) =>
      b.count - a.count ||
      a.teamA.localeCompare(b.teamA) ||
      a.teamB.localeCompare(b.teamB)
    );
  }
</script>

<style>
  #main {
    margin: 30px auto;
    width: 95%;
    max-width: 1000px;
  }

  .panel {
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 16px;
    background: rgba(0,0,0,.35);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 10px;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }

  .teamCell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .count {
    text-align: right;
    width: 80px;
  }

  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    background: rgba(0,0,0,.4);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 8px;
    color: inherit;
  }
</style>

<div id="main">
  {#await waitForAll(transactionsData, playersData, leagueTeamManagersData)}
    <LinearProgress indeterminate />
  {:then resolved}
    {@const txPkg = resolved[0]}
    {@const playersInfo = resolved[1]}
    {@const leagueTeamManagers = resolved[2]}

    {@const rows = computePairs(txPkg.transactions, leagueTeamManagers)}
    {@const filtered = partnerSearch
      ? rows.filter(r =>
          `${r.teamA} ${r.teamB}`.toLowerCase().includes(partnerSearch.toLowerCase())
        )
      : rows}

    <div class="panel">
      <h2>Trade Partners</h2>
      <input placeholder="Search teams..." bind:value={partnerSearch} />

      <table>
        <thead>
          <tr>
            <th>Team A</th>
            <th>Team B</th>
            <th class="count">Trades</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as r (r.teamA + r.teamB)}
            <tr>
              <td class="teamCell">
                <SleeperAvatar slug={r.slugA} size={22} />
                {r.teamA}
              </td>
              <td class="teamCell">
                <SleeperAvatar slug={r.slugB} size={22} />
                {r.teamB}
              </td>
              <td class="count">{r.count}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <TransactionsPage
      playersInfo={playersInfo}
      stale={txPkg.stale}
      transactions={txPkg.transactions}
      currentTeams={txPkg.currentTeams}
      {show}
      {query}
      queryPage={page}
      {perPage}
      postUpdate={true}
      {leagueTeamManagers}
    />
  {/await}
</div>
