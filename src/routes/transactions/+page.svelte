<script>
  import LinearProgress from '@smui/linear-progress';
  import { TransactionsPage } from '$lib/components';
  import SleeperAvatar from '$lib/components/SleeperAvatar.svelte';
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

  // ----------------------------
  // Use your site's canonical mapping:
  // leagueTeamManagers.teamManagersMap[season][roster]
  // ----------------------------
  function resolveRosterMeta(leagueTeamManagers, season, rosterId) {
    const s = String(season ?? '').trim();
    const rid = String(rosterId ?? '').trim();

    const tm =
      leagueTeamManagers?.teamManagersMap?.[s]?.[rid] ??
      leagueTeamManagers?.teamManagersMap?.[Number(s)]?.[Number(rid)] ??
      null;

    // Most likely fields; keep fallbacks so we don't break if structure differs slightly
    const name =
      tm?.teamName ??
      tm?.team_name ??
      tm?.name ??
      tm?.displayName ??
      tm?.display_name ??
      `Roster ${rid}`;

    // This should match leagueInfo.managers slugs (used by SleeperAvatar)
    const slug = Array.isArray(tm?.managers) && tm.managers.length ? String(tm.managers[0]) : '';

    return { name: normalizeTeam(name), slug };
  }

  // ----------------------------
  // Pairwise counts (2-way + 3-way)
  // 3-way trades credit each pair inside the deal
  // ----------------------------
  function computePairCounts(transactions, leagueTeamManagers) {
    const pairCounts = new Map();

    const incPair = (a, b) => {
      const A = a.name.toLowerCase() <= b.name.toLowerCase() ? a : b;
      const B = a.name.toLowerCase() <= b.name.toLowerCase() ? b : a;
      const key = `${A.name}|||${B.name}`;

      const prev = pairCounts.get(key);
      if (prev) prev.count += 1;
      else pairCounts.set(key, { teamA: A.name, teamB: B.name, slugA: A.slug, slugB: B.slug, count: 1 });
    };

    for (const tx of transactions ?? []) {
      if (tx?.type !== 'trade') continue;

      const season = tx?.season;
      const rosterIds = Array.isArray(tx?.rosters) ? tx.rosters : [];

      const rawTeams = rosterIds.map((rid) => resolveRosterMeta(leagueTeamManagers, season, rid));

      // de-dupe after normalization (aliases can collapse)
      const seen = new Set();
      const teams = [];
      for (const t of rawTeams) {
        const k = cleanKey(t.name);
        if (!k || seen.has(k)) continue;
        seen.add(k);
        teams.push(t);
      }

      if (teams.length !== 2 && teams.length !== 3) continue;

      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          incPair(teams[i], teams[j]);
        }
      }
    }

    const rows = Array.from(pairCounts.values());
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
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 10px;
    padding: 14px 14px 10px;
    margin-bottom: 16px;
    background: rgba(0, 0, 0, 0.35);
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
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.45);
    color: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    text-align: left;
    padding: 10px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

  .teamCell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
</style>

<div id="main">
  {#await waitForAll(transactionsData, playersData, leagueTeamManagersData)}
    <div class="loading">
      <p>Loading league transactions...</p>
      <LinearProgress indeterminate />
    </div>
  {:then [{ transactions, currentTeams, stale }, playersInfo, leagueTeamManagers]}

    {@const partnerRows = computePairCounts(transactions, leagueTeamManagers)}
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
                <td>
                  <span class="teamCell">
                    <SleeperAvatar slug={r.slugA || ''} size={22} alt={r.teamA} />
                    {r.teamA}
                  </span>
                </td>
                <td>
                  <span class="teamCell">
                    <SleeperAvatar slug={r.slugB || ''} size={22} alt={r.teamB} />
                    {r.teamB}
                  </span>
                </td>
                <td class="count">{r.count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
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
