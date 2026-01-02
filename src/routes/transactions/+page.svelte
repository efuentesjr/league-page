<script>
  import LinearProgress from '@smui/linear-progress';

  export let data;

  const {
    show,
    query,
    page,
    playersData,
    transactionsData,
    leagueTeamManagersData
  } = data;

  // ---- helpers ----
  function safeStr(x) {
    return (x ?? '').toString();
  }

  function getSeason(tx) {
    // Try common fields you might have in your normalized data
    return (
      tx.season ??
      tx.year ??
      tx.league_year ??
      tx.metadata?.season ??
      null
    );
  }

  function normalizeTransactions(transactions) {
    // Assumes transactionsData already contains trade-like records.
    // If your "normalized" step is elsewhere, keep it there and just return it.
    // This function just ensures we always return an array.
    return Array.isArray(transactions) ? transactions : [];
  }

  // Build a "current teams" lookup from leagueTeamManagersData if you need it
  function buildCurrentTeams(leagueTeamManagers) {
    // Keep generic: return whatever structure your compute function expects.
    // If you already have currentTeams elsewhere, use that instead.
    return leagueTeamManagers;
  }

  /**
   * computeTradePartnerCounts(transactionsNormalized, leagueTeamManagers, currentTeams, seasonKey)
   * -> returns an array of rows like:
   *    [{ aRosterId, aName, bRosterId, bName, tradeCount }, ...]
   *
   * IMPORTANT: keep YOUR existing implementation if you already have one.
   * Below is a safe placeholder that expects "transactionsNormalized" trades with "rosters" involved.
   */
  function computeTradePartnerCounts(transactionsNormalized, leagueTeamManagers, currentTeams, seasonKey) {
    const seasonFilter = seasonKey === 'all' ? null : seasonKey;

    // You may already have manager/team name lookups. This tries a few shapes.
    const rosterIdToName = new Map();
    (leagueTeamManagers || []).forEach((t) => {
      // try common keys; adjust if you know exact schema
      const rid = t.roster_id ?? t.rosterId ?? t.id;
      const name = t.team_name ?? t.teamName ?? t.name ?? t.manager ?? t.display_name ?? t.displayName;
      if (rid != null && name) rosterIdToName.set(String(rid), String(name));
    });

    const pairCounts = new Map();

    for (const tx of transactionsNormalized) {
      const season = getSeason(tx);
      if (seasonFilter != null && String(season) !== String(seasonFilter)) continue;

      // Expecting trades have something like tx.roster_ids or tx.rosters
      const rosterIds =
        tx.roster_ids ??
        tx.rosterIds ??
        tx.rosters ??
        tx.participants ??
        [];

      if (!Array.isArray(rosterIds) || rosterIds.length < 2) continue;

      // Count each unique pair in this trade
      const unique = Array.from(new Set(rosterIds.map((r) => String(r)))).sort();
      for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
          const a = unique[i];
          const b = unique[j];
          const key = `${a}__${b}`;
          pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
        }
      }
    }

    const rows = [];
    for (const [key, tradeCount] of pairCounts.entries()) {
      const [aRosterId, bRosterId] = key.split('__');
      rows.push({
        aRosterId,
        aName: rosterIdToName.get(aRosterId) ?? `Roster ${aRosterId}`,
        bRosterId,
        bName: rosterIdToName.get(bRosterId) ?? `Roster ${bRosterId}`,
        tradeCount
      });
    }

    // Sort highest trade counts first, then alphabetical
    rows.sort((r1, r2) => {
      if (r2.tradeCount !== r1.tradeCount) return r2.tradeCount - r1.tradeCount;
      const n1 = `${r1.aName} vs ${r1.bName}`.toLowerCase();
      const n2 = `${r2.aName} vs ${r2.bName}`.toLowerCase();
      return n1.localeCompare(n2);
    });

    return rows;
  }

  // ---- derived data ----
  let transactionsNormalized = [];
  let currentTeams = [];

  // If your loader provides normalized data already, swap these lines to use it.
  $: transactionsNormalized = normalizeTransactions(transactionsData);
  $: currentTeams = buildCurrentTeams(leagueTeamManagersData);

  // Collect seasons found in transactions (exclude null/undefined)
  $: seasons = Array.from(
    new Set(transactionsNormalized.map(getSeason).filter((s) => s != null).map((s) => String(s)))
  ).sort((a, b) => Number(b) - Number(a)); // numeric-desc

  // Pre-compute rows for "All Years" and each year (NO {@const} needed)
  let rowsAll = [];
  let rowsBySeason = {};

  $: rowsAll = computeTradePartnerCounts(
    transactionsNormalized,
    leagueTeamManagersData,
    currentTeams,
    'all'
  );

  $: rowsBySeason = seasons.reduce((acc, season) => {
    acc[season] = computeTradePartnerCounts(
      transactionsNormalized,
      leagueTeamManagersData,
      currentTeams,
      season
    );
    return acc;
  }, {});
</script>

{#if show === false}
  <LinearProgress indeterminate />
{:else}
  <div class="wrap">
    <h1>Head to Head Trades</h1>

    <details open>
      <summary>All Years</summary>

      {#if rowsAll.length === 0}
        <p class="muted">No trades found.</p>
      {:else}
        <div class="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Teams</th>
                <th class="num">Trades</th>
              </tr>
            </thead>
            <tbody>
              {#each rowsAll as row (row.aRosterId + '_' + row.bRosterId)}
                <tr>
                  <td>{row.aName} vs {row.bName}</td>
                  <td class="num">{row.tradeCount}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </details>

    {#each seasons as season (season)}
      <details>
        <summary>{season}</summary>

        {#if (rowsBySeason[season] ?? []).length === 0}
          <p class="muted">No trades found for {season}.</p>
        {:else}
          <div class="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Teams</th>
                  <th class="num">Trades</th>
                </tr>
              </thead>
              <tbody>
                {#each rowsBySeason[season] as row (row.aRosterId + '_' + row.bRosterId)}
                  <tr>
                    <td>{row.aName} vs {row.bName}</td>
                    <td class="num">{row.tradeCount}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </details>
    {/each}
  </div>
{/if}

<style>
  .wrap {
    padding: 16px;
  }
  h1 {
    margin: 0 0 12px 0;
    font-size: 22px;
    font-weight: 700;
  }
  details {
    margin: 10px 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 10px 12px;
  }
  summary {
    cursor: pointer;
    font-weight: 700;
  }
  .muted {
    opacity: 0.75;
    margin: 10px 0 0 0;
  }
  .tableWrap {
    overflow-x: auto;
    margin-top: 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 420px;
  }
  th,
  td {
    padding: 10px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    vertical-align: top;
  }
  th {
    text-align: left;
    font-size: 12px;
    opacity: 0.8;
    letter-spacing: 0.02em;
  }
  .num {
    text-align: right;
    width: 90px;
    white-space: nowrap;
  }
</style>
