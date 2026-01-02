<script>
  import LinearProgress from '@smui/linear-progress';
  import { TransactionsPage } from '$lib/components';

  export let data;
  const { show, query, page, playersData, transactionsData, leagueTeamManagersData } = data;

  const perPage = 10;
  let partnerSearch = '';

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
      return v.teamName || v.team_name || v.name || v.team || '';
    }
    return String(v);
  }

  // ----------------------------
  // Resolve roster -> { name, slug }
  // Try leagueTeamManagers first, then currentTeams fallback.
  // ----------------------------
  function resolveRoster(leagueTeamManagers, currentTeams, season, rosterId) {
    const rid = Number(rosterId);

    // 1) leagueTeamManagers (various shapes)
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

      const rawSlug =
        (Array.isArray(tm.managers) && tm.managers[0]) ||
        tm.slug ||
        tm.managerSlug ||
        '';

      const finalName = normalizeTeamName(nameToString(rawName));
      if (finalName) return { name: finalName, slug: String(rawSlug ?? '') };
    }

    // 2) currentTeams fallback
    const ct = currentTeams?.[rid] ?? currentTeams?.[String(rid)];
    if (ct) {
      if (typeof ct === 'string') {
        const finalName = normalizeTeamName(ct);
        return finalName ? { name: finalName, slug: '' } : null;
      }

      const rawName = ct.teamName || ct.team_name || ct.name || ct.team || '';
      const rawSlug = ct.slug || ct.managerSlug || '';
      const finalName = normalizeTeamName(nameToString(rawName));
      return finalName ? { name: finalName, slug: String(rawSlug ?? '') } : null;
    }

    return null;
  }

  // ----------------------------
  // Compute pairwise counts (2-way + 3-way; 3-way credited to each pair)
  // ----------------------------
  function computeTradePartnerCounts(transactions, leagueTeamManagers, currentTeams) {
    const pairs = new Map();

    function inc(a, b) {
      const nameA = normalizeTeamName(nameToString(a?.name));
      const nameB = normalizeTeamName(nameToString(b?.name));
      if (!nameA || !nameB) return;

      const A = nameA.localeCompare(nameB) <= 0
        ? { ...a, name: nameA }
        : { ...b, name: nameB };

      const B = A === a
        ? { ...b, name: nameB }
        : { ...a, name: nameA };

      const pairKey = `${A.name}|||${B.name}`;

      if (!pairs.has(pairKey)) {
        pairs.set(pairKey, {
          teamA: A.name,
          teamB: B.name,
          slugA: A.slug || '',
          slugB: B.slug || '',
          count: 0
        });
      }

      pairs.get(pairKey).count++;
    }

    for (const tx of transactions ?? []) {
      if (tx.type !== 'trade') continue;

      const season = tx.season;
      const rosterIds = tx.rosters ?? [];
      if (rosterIds.length < 2 || rosterIds.length > 3) continue;

      const teams = rosterIds
        .map((rid) => resolveRoster(leagueTeamManagers, currentTeams, season, rid))
        .filter(Boolean)
        .map(t => ({ name: t.name, slug: t.slug }))
        .filter(t => t.name);

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

  .panel h2 {
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 600;
  }

  .search {
    width: 100%;
    padding: 10px;
    margin: 6px 0 12px 0;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .count {
    text-align: right;
    width: 90px;
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

    {@const rows = computeTradePartnerCounts(transactions, leagueTeamManagers, currentTeams)}
    {@const filtered = partnerSearch
      ? rows.filter(r => `${r.teamA} ${r.teamB}`.toLowerCase().includes(partnerSearch.toLowerCase()))
      : rows
    }

    <div class="panel">
      <h2>Trade Partners</h2>
      <input class="search" placeholder="Search teams..." bind:value={partnerSearch} />

      <table>
        <thead>
          <tr>
            <th>Team A</th>
            <th>Team B</th>
            <th class="count">Trades</th>
          </tr>
        </thead>
        <tbody>
          {#if filtered.length === 0}
            <tr>
              <td colspan="3" style="opacity:.8;">No results.</td>
            </tr>
          {:else}
            {#each filtered as r (r.teamA + r.teamB)}
              <tr>
                <td>{r.teamA}</td>
                <td>{r.teamB}</td>
                <td class="count">{r.count}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
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
