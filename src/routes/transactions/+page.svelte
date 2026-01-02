<script>
  import LinearProgress from '@smui/linear-progress';
  export let data;

  const {
    show,
    transactionsData,
    leagueTeamManagersData
  } = data;

  function getSeason(tx) {
    return tx?.season ?? tx?.year ?? tx?.league_year ?? tx?.metadata?.season ?? null;
  }

  function normalizeTransactions(transactions) {
    return Array.isArray(transactions) ? transactions : [];
  }

  function computeTradePartnerCounts(transactionsNormalized, leagueTeamManagers, currentTeams, seasonKey) {
    // IMPORTANT: make this function impossible to throw
    try {
      const seasonFilter = seasonKey === 'all' ? null : seasonKey;

      const rosterIdToName = new Map();
      (Array.isArray(leagueTeamManagers) ? leagueTeamManagers : []).forEach((t) => {
        const rid = t?.roster_id ?? t?.rosterId ?? t?.id;
        const name =
          t?.team_name ?? t?.teamName ?? t?.name ?? t?.manager ?? t?.display_name ?? t?.displayName;
        if (rid != null && name) rosterIdToName.set(String(rid), String(name));
      });

      const pairCounts = new Map();

      for (const tx of Array.isArray(transactionsNormalized) ? transactionsNormalized : []) {
        const season = getSeason(tx);
        if (seasonFilter != null && String(season) !== String(seasonFilter)) continue;

        const rosterIds =
          tx?.roster_ids ??
          tx?.rosterIds ??
          tx?.rosters ??
          tx?.participants ??
          [];

        if (!Array.isArray(rosterIds) || rosterIds.length < 2) continue;

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

      rows.sort((r1, r2) => {
        if (r2.tradeCount !== r1.tradeCount) return r2.tradeCount - r1.tradeCount;
        return (`${r1.aName} vs ${r1.bName}`).localeCompare(`${r2.aName} vs ${r2.bName}`);
      });

      return rows;
    } catch (e) {
      return [];
    }
  }

  // ---- derived data (guarded) ----
  $: transactionsNormalized = normalizeTransactions(transactionsData);
  $: managers = Array.isArray(leagueTeamManagersData) ? leagueTeamManagersData : [];
  $: currentTeams = managers;

  $: seasons = Array.from(
    new Set(transactionsNormalized.map(getSeason).filter((s) => s != null).map((s) => String(s)))
  ).sort((a, b) => Number(b) - Number(a));

  $: rowsAll = computeTradePartnerCounts(transactionsNormalized, managers, currentTeams, 'all');

  $: rowsBySeason = seasons.reduce((acc, season) => {
    acc[season] = computeTradePartnerCounts(transactionsNormalized, managers, currentTeams, season);
    return acc;
  }, {});
</script>
