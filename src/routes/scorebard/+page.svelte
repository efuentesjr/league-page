<script>
  const title = "MFFL LIVE SCOREBOARD";
  const season = "2026 SEASON";
  const week = "WEEK 1";
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="scoreboard">
  <header>
    <h1>{title}</h1>
    <div class="season">{season} • {week}</div>
  </header>
</div>

<style>
  .scoreboard {
    min-height: 100vh;
    background: #000;
    color: #fff;
    font-family: Arial, Helvetica, sans-serif;
  }

  header {
    text-align: center;
    padding: 30px 20px;
  }

  h1 {
    margin: 0;
    font-size: 42px;
    letter-spacing: 4px;
  }

  .season {
    margin-top: 10px;
    font-size: 18px;
    letter-spacing: 3px;
    color: #aaa;
  }
</style>
