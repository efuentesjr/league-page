<script>
  import LinearProgress from '@smui/linear-progress';
  import { TransactionsPage } from '$lib/components';
  import SleeperAvatar from '$lib/components/SleeperAvatar.svelte';
  import { waitForAll } from '$lib/utils/helper';

  export let data;
  const { show, query, page, playersData, transactionsData, leagueTeamManagersData } = data;

  const perPage = 10;

  /* ----------------------------------
     NORMALIZATION
  ---------------------------------- */
  const aliasToCanonical = new Map([
    ['los loquitos', 'Los Loquitos'],
    ['slikbears all luck', 'Los Loquitos'],
    ['sb bound', 'Los Loquitos'],

    ['slickbears', 'SlickBears'],

    ['primetime prodigies', 'PrimeTime Prodigies'],
    ['primetime j', 'PrimeTime Prodigies'],

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
    ['chosen one', 'The Process']
  ]);

  const clean = (v) => String(v ?? '').trim();
  const cleanKey = (v) => clean(v).toLowerCase();

  function normalizeTeam(name) {
    const key = cleanKey(name);
    return aliasToCanonical.get(key) ?? clean(name);
  }

  /* ----------------------------------
     CANONICAL TEAM RESOLUTION
  ---------------------------------- */
  function resolveTeam(leagueTeamManagers, season, rosterId) {
    const tm = leagueTeamManagers?.teamManagersMap?.[season]?.[rosterId];
    if (!tm) return null;

    return {
      name: normalizeTeam(tm.teamName ?? ''),
      slug: String(tm.managers?.[0] ?? '')
    };
  }

  /* ----------------------------------
     PAIR COUNTS (SAFE)
  ---------------------------------- */
  function computePairCounts(transactions, leagueTeamManagers) {
    const map = new Map();

    function addPair(a, b) {
      if (!a?.name || !b?.name) return;

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
    }

    for (const tx of transactions ?? []) {
      if (tx.type !== 'trade') continue;

      const season = tx.season;
      const teams = (tx.rosters ?? [])
        .map(rid => resolveTeam(leagueTeamManagers, season, rid))
        .filter(t => t && t.name);

      if (teams.length < 2 || teams.length > 3) continue;

      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          addPair(teams[i], teams[j]);
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      (b.count - a.count) ||
      clean(a.teamA).localeCompare(clean(b.teamA)) ||
      clean(a.teamB).localeCompare(clean(b.teamB))
    );
  }

  let partnerSearch = '';
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
  {:then [{ transactions]()
