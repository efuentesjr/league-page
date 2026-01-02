<script>
  import LinearProgress from '@smui/linear-progress';
  import { TransactionsPage } from '$lib/components';

  export let data;
  const { show, query, page, playersData, transactionsData, leagueTeamManagersData } = data;

  const perPage = 10;

  // year filter: "all" or a specific year number
  let yearFilter = 'all';

  // ----------------------------
  // Prevent infinite loading
  // ----------------------------
  function withTimeout(promise, ms = 30000, label = 'data') {
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
      )
    ]);
  }

  const allData = Promise.all([
    withTimeout(transactionsData, 30000, 'transactionsData'),
    withTimeout(playersData, 30000, 'playersData'),
    withTimeout(leagueTeamManagersData, 30000, 'leagueTeamManagersData')
  ]);

  // ----------------------------
  // Name normalization (your rules)
  // ----------------------------
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
    ['vick2times ', 'Vick2times'],

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

  const clean = (v) => String(v ?? '').trim();
  const key = (v) => clean(v).toLowerCase();

  function normalizeTeamName(name) {
    const k = key(name);
    return aliasToCanonical.get(k) ?? clean(name);
  }

  // Ensure we never render [object Object]
  function nameToString(v) {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      return v.teamName || v.team_name || v.name || v.team || v.rosterName || '';
    }
    return String(v);
  }

  // ----------------------------
  // Resolve roster -> canonical team name
  // ----------------------------
  function resolveRosterName(leagueTeamManagers, currentTeams, season, rosterId) {
    const rid = Number(rosterId);

    // 1) leagueTeamManagers
    const tmMap = leagueTeamManagers?.teamManagersMap?.[season];
    const tm = tmMap?.[rid];

    if (tm) {
      const rawName =
        tm.teamName ||
        tm.team_name ||
        tm.name ||
        tm.team ||
        tm.rosterName ||
        '';

      const finalName = normalizeTeamName(nameToString(rawName));
      if (finalName) return finalName;
    }

    // 2) currentTeams fallback
    const ct = currentTeams?.[rid] ?? currentTeams?.[String(rid)];
    if (ct) {
      if (typeof ct === 'string') {
        const finalName = normalizeTeamName(ct);
        return finalName || null;
      }

      const rawName = ct.teamName || ct.team_name || ct.name || ct.team || '';
      const finalName = normalizeTeamName(nameToString(rawName));
      return finalName || null;
    }

    return null;
  }

  // ----------------------------
  // Compute pairwise counts for a given year (or all)
  // 3-way credited to each pair; self-pairs prevented by dedupe.
  // ----------------------------
  function computeTradePartnerCounts(transactions, leagueTeamManagers, currentTeams, year = 'all') {
    const pairs = new Map();

    function pairKey(a, b) {
      return `${a}|||${b}`;
    }

    function inc(a, b) {
      if (!a || !b) return;
      if (a === b) return;

      const AFirst = a.localeCompare(b) <= 0;
      const teamA = AFirst ? a : b;
      const teamB = AFirst ? b : a;

      const k = pairKey(teamA, teamB);

      if (!pairs.has(k)) {
        pairs.set(k, { teamA, teamB, count: 0 });
      }
      pairs.get(k).count++;
    }

    for (const tx of transactions ?? []) {
      if (tx.type !== 'trade') continue;

      const season = tx.season;
      if (year !== 'all' && Number(season) !== Number(year)) continue;

      const rosterIds = tx.rosters ?? [];
      if (rosterIds.length < 2 || rosterIds.length > 3) continue;

      // resolve -> normalize -> DEDUPE by canonical name
      const uniqueByName = new Map();

      for (const rid of rosterIds) {
        const nm = resolveRosterName(leagueTeamManagers, currentTeams, season, rid);
        if (!nm) continue;
        if (!uniqueByName.has(nm)) uniqueByName.set(nm, nm);
      }

      const teams = Array.from(uniqueByName.values());
      if (teams.length < 2) continue;

      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          inc(teams[i], teams[j]);
        }
      }
    }

    return Array.from(pairs.values()).sort(
      (a, b) =>
        b.count - a.count ||
        a.teamA.localeCompare(b.teamA) ||
        a.teamB.localeCompare(b.teamB)
    );
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
    position: relative;
    z-index: 1;
    width: 85%;
    max-width: 500px;
    margin: 80px auto;
  }

  .panel {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 18px;
    background: rgba(0, 0, 0, 0.35);
  }

  .panelHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .panel h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  select {
    padding: 8px 10px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  th,
  td {
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .count {
    text-align: right;
    width: 90px;
  }

  .hint {
    opacity: 0.75;
    font-size: 12px;
    margin-top: 6px;
  }
</style>

<div id="main">
  {#await allData}
    <div class="loading">
      <p>Loading league transactions...</p>
      <LinearProgress indeterminate />
    </div>

  {:then resolved}
    {@const txPkg = resolved[0] ?? {}}
    {@const playersInfo = resolved[1]}
    {@const leagueTeamManagers = resolved[2]}

    {@const transactions = txPkg.transactions ?? []}
    {@const currentTeams = txPkg.currentTeams ?? txPkg.current_teams ?? null}
    {@const stale = txPkg.stale ?? false}

    {@const years = Array.from(
      new Set((transactions ?? []).map(t => t?.season).filter(Boolean).map(Number))
    ).sort((a, b) => b - a)}

    {#if yearFilter === 'all' && years.length > 0}
      {@html ''} <!-- keep yearFilter stable -->
    {/if}

    {@const rows = computeTradePartnerCounts(transactions, leagueTeamManagers, currentTeams, yearFilter)}
    {@const selectedLabel = yearFilter === 'all' ? 'All Years' : String(yearFilter)}

    <div class="panel">
      <div class="panelHeader">
        <h2>Head to Head Trades</h2>

        <div class="controls">
          <select bind:value={yearFilter}>
            <option value="all">All Years</option>
            {#each years as y}
              <option value={String(y)}>{y}</option>
            {/each}
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Team A</th>
            <th>Team B</th>
            <th class="count">Trades</th>
          </tr>
        </thead>
        <tbody>
          {#if rows.length === 0}
            <tr>
              <td colspan="3" style="opacity:.8;">No trades found for {selectedLabel}.</td>
            </tr>
          {:else}
            {#each rows as r (r.teamA + r.teamB)}
              <tr>
                <td>{r.teamA}</td>
                <td>{r.teamB}</td>
                <td class="count">{r.count}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>

      <div class="hint">
        Includes 2-way and 3-way trades. 3-way trades are credited once to each participating pair.
      </div>
    </div>

    <TransactionsPage
      {playersInfo}
      {stale}
      {transactions}
      {currentTeams}
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
