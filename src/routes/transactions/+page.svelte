<script>
  import LinearProgress from '@smui/linear-progress';
  import { TransactionsPage } from '$lib/components';
  import { waitForAll } from '$lib/utils/helper';

  export let data;
  const { show, query, page, playersData, transactionsData, leagueTeamManagersData } = data;

  const perPage = 10;

  /* --------------------------------------------------
   Helpers
  -------------------------------------------------- */
  const clean = (v) => String(v ?? '').trim();
  const key = (v) => clean(v).toLowerCase();

  const aliasToCanonical = new Map([
    ['los loquitos', 'Los Loquitos'],
    ['slikbears all luck', 'Los Loquitos'],
    ['“slikbears” all luck', 'Los Loquitos'],
    ['sb bound', 'Los Loquitos'],
    ['sb bound🏆', 'Los Loquitos'],

    ['slickbears', 'SlickBears'],

    ['primetime prodigies', 'PrimeTime Prodigies'],
    ['primetime j', 'PrimeTime Prodigies'],

    ['brute force attacks', 'Brute Force Attack'],
    ['brute force attack', 'Brute Force Attack'],
    ['end zone entourage', 'Brute Force Attack'],

    ['blue ballers', 'Blue Ballers'],
    ['austin rattlers', 'Blue Ballers'],

    ['demboyz', 'Demboyz'],
    ['88boyz11', 'Demboyz'],

    ['vick2times', 'Vick2times'],

    ['blue tent all-stars', 'Blue Tent All-Stars'],
    ['perfectly balanced', 'Blue Tent All-Stars'],
    ['the snap', 'Blue Tent All-Stars'],
    ['zero dark purdy', 'Blue Tent All-Stars'],

    ['the process', 'The Process'],
    ['death row', 'The Process'],
    ['dreamville', 'The Process'],
    ['chosen one.', 'The Process'],
    ['chosen one', 'The Process']
  ]);

  function normalizeTeam(name) {
    const k = key(name);
    return aliasToCanonical.get(k) ?? clean(name);
  }

  function normalizeTransactionsShape(t) {
    if (Array.isArray(t)) return t;
    if (t && typeof t === 'object') {
      return [
        ...(Array.isArray(t.trades) ? t.trades : []),
        ...(Array.isArray(t.waivers) ? t.waivers : [])
      ];
    }
    return [];
  }

  function resolveRosterName(leagueTeamManagers, currentTeams, season, rosterId) {
    const rid = Number(rosterId);

    const tm = leagueTeamManagers?.teamManagersMap?.[season]?.[rid];
    if (tm) {
      const raw =
        tm.teamName || tm.team_name || tm.name || tm.team || tm.rosterName;
      if (raw) return normalizeTeam(raw);
    }

    const ct = currentTeams?.[rid] ?? currentTeams?.[String(rid)];
    if (ct) {
      if (typeof ct === 'string') return normalizeTeam(ct);
      const raw = ct.teamName || ct.team_name || ct.name || ct.team;
      if (raw) return normalizeTeam(raw);
    }

    return null;
  }

  function computeTradePartnerCounts(transactions, leagueTeamManagers, currentTeams, year = 'all') {
    const pairs = new Map();

    function inc(a, b) {
      if (!a || !b || a === b) return;
      const [x, y] = a.localeCompare(b) <= 0 ? [a, b] : [b, a];
      const k = `${x}|||${y}`;
      if (!pairs.has(k)) pairs.set(k, { teamA: x, teamB: y, count: 0 });
      pairs.get(k).count++;
    }

    for (const tx of transactions) {
      if (tx.type !== 'trade') continue;
      if (year !== 'all' && Number(tx.season) !== Number(year)) continue;

      const unique = new Map();
      for (const rid of tx.rosters ?? []) {
        const nm = resolveRosterName(leagueTeamManagers, currentTeams, tx.season, rid);
        if (nm && !unique.has(nm)) unique.set(nm, nm);
      }

      const teams = [...unique.values()];
      if (teams.length < 2) continue;

      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          inc(teams[i], teams[j]);
        }
      }
    }

    return [...pairs.values()].sort((a, b) => b.count - a.count);
  }
</script>

<style>
  #main {
    position: relative;
    z-index: 1;
    display: block;
    margin: 30px auto;
    width: 95%;
    max-width: 1000px;
    overflow-y: hidden;
  }

  .loading {
    display: block;
    width: 85%;
    max-width: 500px;
    margin: 80px auto;
  }

  details {
    margin-top: 12px;
  }

  summary {
    cursor: pointer;
    font-weight: 600;
    padding: 8px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }

  th, td {
    padding: 6px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  th:last-child,
  td:last-child {
    text-align: right;
  }
</style>

<div id="main">
  {#await waitForAll(transactionsData, playersData, leagueTeamManagersData)}
    <div class="loading">
      <p>Loading league transactions...</p>
      <LinearProgress indeterminate />
    </div>

  {:then [txPkg, playersInfo, leagueTeamManagers]}
    {@const transactionsNormalized = normalizeTransactionsShape(txPkg.transactions)}
    {@const currentTeams = txPkg.currentTeams ?? txPkg.current_teams}
    {@const stale = txPkg.stale ?? false}

    {@const years = Array.from(
      new Set(transactionsNormalized.map(t => t.season).filter(Boolean))
    ).sort((a, b) => b - a)}

    <!-- ========================= -->
    <!-- Head to Head Trades -->
    <!-- ========================= -->
    <h2>Head to Head Trades</h2>

    <!-- All Years -->
    <details open>
      <summary>All Years</summary>
      {@const rowsAll = computeTradePartnerCounts(transactionsNormalized, leagueTeamManagers, currentTeams, 'all')}

      <table>
        <thead>
          <tr>
            <th>Team A</th>
            <th>Team B</th>
            <th>Trades</th>
          </tr>
        </thead>
        <tbody>
          {#each rowsAll as r (r.teamA + r.teamB)}
            <tr>
              <td>{r.teamA}</td>
              <td>{r.teamB}</td>
              <td>{r.count}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </details>

    <!-- Per Year -->
    {#each years as y}
      <details>
        <summary>{y}</summary>
        {@const rowsYear = computeTradePartnerCounts(transactionsNormalized, leagueTeamManagers, currentTeams, y)}

        <table>
          <thead>
            <tr>
              <th>Team A</th>
              <th>Team B</th>
              <th>Trades</th>
            </tr>
          </thead>
          <tbody>
            {#each rowsYear as r (r.teamA + r.teamB)}
              <tr>
                <td>{r.teamA}</td>
                <td>{r.teamB}</td>
                <td>{r.count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </details>
    {/each}

    <!-- Existing Transactions Page -->
    <TransactionsPage
      {playersInfo}
      {stale}
      transactions={txPkg.transactions}
      currentTeams={currentTeams}
      {show}
      {query}
      queryPage={page}
      {perPage}
      postUpdate={true}
      {leagueTeamManagers}
    />

  {:catch error}
    <p class="center">Something went wrong: {error.message}</p>
  {/await}
</div>
