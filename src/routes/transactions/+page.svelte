<script>
  import LinearProgress from '@smui/linear-progress';
  import { TransactionsPage } from '$lib/components';

  export let data;
  const { show, query, page, playersData, transactionsData, leagueTeamManagersData } = data;

  const perPage = 10;

  // Prevent "infinite loading" if any upstream promise never resolves
  function withTimeout(promise, ms = 30000, label = 'data') {
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
      )
    ]);
  }

  // Use native Promise.all instead of custom waitForAll
  const allData = Promise.all([
    withTimeout(transactionsData, 30000, 'transactionsData'),
    withTimeout(playersData, 30000, 'playersData'),
    withTimeout(leagueTeamManagersData, 30000, 'leagueTeamManagersData')
  ]);
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
