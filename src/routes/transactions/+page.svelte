<script>
  import LinearProgress from '@smui/linear-progress';
  import { TransactionsPage } from '$lib/components';
  import { waitForAll } from '$lib/utils/helper';

  export let data;
  const { show, query, page, playersData, transactionsData, leagueTeamManagersData } = data;

  const perPage = 10;

  // ----------------------------
  // Normalization (your rules)
  // ----------------------------
  const aliasToCanonical = new Map([
    // Los Loquitos group
    ['los loquitos', 'Los Loquitos'],
    ['"slikbears" all luck', 'Los Loquitos'],
    ['slikbears all luck', 'Los Loquitos'],
    ['sb bound🏆', 'Los Loquitos'],
    ['sb bound', 'Los Loquitos'],

    // SlickBears separate
    ['slickbears', 'SlickBears'],

    // PrimeTime Prodigies group
    ['primetime prodigies', 'PrimeTime Prodigies'],
    ['primetime j', 'PrimeTime Prodigies'],

    // Brute Force Attack group
    ['brute force attack', 'Brute Force Attack'],
    ['brute force attacks', 'Brute Force Attack'],
    ['end zone entourage', 'Brute Force Attack'],

    // Blue Ballers group
    ['blue ballers', 'Blue Ballers'],
    ['austin rattlers', 'Blue Ballers'],
    ['blueballers', 'Blue Ballers'],
    ['blue ba llers', 'Blue Ballers'],
    ['blue  ballers', 'Blue Ballers'],
    ['blu e ballers', 'Blue Ballers'],

    // Demboyz group
    ['demboyz', 'Demboyz'],
    ['88boyz11', 'Demboyz'],

    // Vick2times group
    ['vick2times', 'Vick2times'],

    // Blue Tent group
    ['blue tent all-stars', 'Blue Tent All-Stars'],
    ['perfectly balanced', 'Blue Tent All-Stars'],
    ['the snap', 'Blue Tent All-Stars'],
    ['zero dark purdy', 'Blue Tent All-Stars'],

    // The Process group
    ['the process', 'The Process'],
    ['death row', 'The Process'],
    ['dreamville', 'The Process'],
    ['chosen one.', 'The Process'],
    ['chosen one', 'The Process']
  ]);

  function cleanKey(s) {
    return String(s ?? '')
      .trim()
      .replaceAll('’', "'")
      .replaceAll('“', '"')
      .replaceAll('”', '"')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function normalizeTeam(name) {
    const key = cleanKey(name);
    return aliasToCanonical.get(key) ?? String(name ?? '').trim();
  }

  function uniqNormalized(names) {
    const seen = new Set();
    const out = [];
    for (const n of names ?? []) {
      const nn = normalizeTeam(n);
      const k = cleanKey(nn);
      if (!k) continue;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(nn);
      }
    }
    return out;
  }

  // ----------------------------
  // Build roster_id -> team name lookup (defensive)
  // ----------------------------
  function buildRosterNameLookup(leagueTeamManagers, currentTeams) {
    const map = new Map();

    const trySet = (rid, name) => {
      if (rid == null) return;
      const key = String(rid);
      const val = String(name ?? '').trim();
      if (!val) return;
      if (!map.has(key)) map.set(key, val);
    };

    // 1) leagueTeamManagers: often array of objects
    if (Array.isArray(leagueTeamManagers)) {
      for (const m of leagueTeamManagers) {
        const rid = m?.roster_id ?? m?.rosterId ?? m?.roster ?? m?.id;
        const name =
          m?.team_name ??
          m?.teamName ??
          m?.metadata?.team_name ??
          m?.display_name ??
          m?.displayName ??
          m?.name ??
          m?.username ??
          m?.slug;
        trySet(rid, name);
      }
    } else if (leagueTeamManagers && typeof leagueTeamManagers === 'object') {
      // sometimes it’s already a map-like object
      for (const [k, v] of Object.entries(leagueTeamManagers)) {
        if (v && typeof v === 'object') {
          const rid = v?.roster_id ?? v?.rosterId ?? k;
          const name =
            v?.team_name ??
            v?.teamName ??
            v?.metadata?.team_name ??
            v?.display_name ??
            v?.displayName ??
            v?.name ??
            v?.username ??
            v?.slug;
          trySet(rid, name);
        } else {
          // k -> string name
          trySet(k, v);
        }
      }
    }

    // 2) currentTeams: often array or object keyed by roster_id
    if (Array.isArray(currentTeams)) {
      for (const t of currentTeams) {
        const rid = t?.roster_id ?? t?.rosterId ?? t?.roster ?? t?.id;
        const name = t?.team_name ?? t?.teamName ?? t?.name ?? t?.display_name ?? t?.displayName ?? t?.slug;
        trySet(rid, name);
      }
    } else if (currentTeams && typeof currentTeams === 'object') {
      for (const [k, v] of Object.entries(currentTeams)) {
        if (v && typeof v === 'object') {
          const rid = v?.roster_id ?? v?.rosterId ?? k;
          const name = v?.team_name ?? v?.teamName ?? v?.name ?? v?.display_name ?? v?.displayName ?? v?.slug;
          trySet(rid, name);
        } else {
          trySet(k, v);
        }
      }
    }

    return map;
  }

  // ----------------------------
  // Extract trade participants (2-way/3-way) from a transaction (defensive)
  // ----------------------------
  function isTrade(tx) {
    const t = String(tx?.type ?? tx?.transaction_type ?? tx?.transactionType ?? '').toLowerCase();
    // common values: "trade" / "traded"
    if (t.includes('trade')) return true;

    // fallback: some models store "trade" as a category
    const cat = String(tx?.category ?? tx?.kind ?? '').toLowerCase();
    if (cat.includes('trade')) return true;

    return false;
  }

  function getRosterIds(tx) {
    // Sleeper raw: roster_ids: [1,2] or [1,2,3]
    const r =
      tx?.roster_ids ??
      tx?.rosterIds ??
      tx?.rosters ??
      tx?.participants ??
      tx?.teams ??
      null;

    if (Array.isArray(r)) return r;

    // sometimes nested
    if (Array.isArray(tx?.metadata?.roster_ids)) return tx.metadata.roster_ids;

    return [];
  }

  function computePairCounts(transactions, leagueTeamManagers, currentTeams) {
    const lookup = buildRosterNameLookup(leagueTeamManagers, currentTeams);
    const pairCounts = new Map();

    const incPair = (a, b) => {
      const A = a.toLowerCase() <= b.toLowerCase() ? a : b;
      const B = a.toLowerCase() <= b.toLowerCase() ? b : a;
      const key = `${A}|||${B}`;
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    };

    for (const tx of transactions ?? []) {
      if (!isTrade(tx)) continue;

      const rosterIds = getRosterIds(tx);
      const teamNamesRaw = rosterIds.map((rid) => lookup.get(String(rid)) ?? `Roster ${rid}`);
      const teamNames = uniqNormalized(teamNamesRaw);

      // only count 2-way and 3-way after normalization
      if (teamNames.length !== 2 && teamNames.length !== 3) continue;

      // credit each pair inside the trade (3-way => 3 pairs)
      for (let i = 0; i < teamNames.length; i++) {
        for (let j = i + 1; j < teamNames.length; j++) {
          incPair(teamNames[i], teamNames[j]);
        }
      }
    }

    const rows = Array.from(pairCounts.entries()).map(([k, count]) => {
      const [teamA, teamB] = k.split('|||');
      return { teamA, teamB, count };
    });

    rows.sort((x, y) => y.count - x.count || x.teamA.localeCompare(y.teamA) || x.teamB.localeCompare(y.teamB));
    return rows;
  }

  let partnerSearch = '';
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
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    padding: 14px 14px 10px;
    margin-bottom: 16px;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(6px);
  }

  .panel h2 {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 700;
  }

  .panel .hint {
    opacity: 0.8;
    font-size: 12px;
    margin: 0 0 10px;
  }

  .searchRow {
    display: flex;
    gap: 10px;
    margin: 10px 0 12px;
  }

  .searchRow input {
    flex: 1;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.45);
    color: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    text-align: left;
    padding: 10px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-size: 14px;
  }

  th {
    font-size: 12px;
    opacity: 0.85;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .count {
    width: 90px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
</style>

<div id="main">
  {#await waitForAll(transactionsData, playersData, leagueTeamManagersData)}
    <div class="loading">
      <p>Loading league transactions...</p>
      <LinearProgress indeterminate />
    </div>
  {:then [{ transactions, currentTeams, stale }, playersInfo, leagueTeamManagers]}

    <!-- Trade partner counts (piggy-back on already-loaded data) -->
    {@const partnerRows = computePairCounts(transactions, leagueTeamManagers, currentTeams)}
    {@const filteredPartnerRows = partnerSearch
      ? partnerRows.filter(r => `${r.teamA} ${r.teamB}`.toLowerCase().includes(partnerSearch.toLowerCase()))
      : partnerRows
    }

    <div class="panel">
      <h2>Trade Partners</h2>
      <p class="hint">
        Counts are normalized using your manager/team merge rules. 3-way trades credit each pair inside the deal.
      </p>

      <div class="searchRow">
        <input placeholder="Search team name..." bind:value={partnerSearch} />
      </div>

      {#if filteredPartnerRows.length === 0}
        <p style="opacity:0.8;">No matches.</p>
      {:else}
        <table>
          <thead>
            <tr>
              <th>Team A</th>
              <th>Team B</th>
              <th class="count">Trades</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredPartnerRows as r (r.teamA + '|' + r.teamB)}
              <tr>
                <td>{r.teamA}</td>
                <td>{r.teamB}</td>
                <td class="count">{r.count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>

    <!-- Existing page (unchanged) -->
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
