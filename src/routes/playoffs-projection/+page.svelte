<script>
  // Expecting { projections, error } from +page.server.js
  export let data;
  const rows = Array.isArray(data?.projections) ? data.projections : [];
  const err = data?.error || '';
</script>

<style>
  .page {
    min-height: 100vh;
    background: radial-gradient(circle at 20% 20%, #0b0b0b 0%, #000 100%);
    color: #fff;
    padding: 2rem 1.25rem;
  }
  h1 {
    margin: 0 0 1rem 0;
    font-size: 1.8rem;
    font-weight: 700;
  }
  .error {
    background: #2a1111;
    border: 1px solid #5c1b1b;
    color: #ffb3b3;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    overflow: hidden;
  }
  th, td {
    padding: 0.65rem 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    text-align: left;
    font-size: 0.95rem;
  }
  th {
    background: rgba(255,255,255,0.04);
    font-weight: 600;
  }
  tbody tr:hover {
    background: rgba(0,186,255,0.08);
  }
  a.teamlink {
    color: #00baff;
    text-decoration: none;
    border-bottom: 1px solid rgba(0,186,255,0.35);
    padding-bottom: 1px;
  }
  .muted { opacity: 0.65; }
</style>

<div class="page">
  <h1>Playoff Projections</h1>

  {#if err}
    <div class="error">Error loading projections: {err}</div>
  {/if}

  {#if rows.length === 0}
    <div class="muted">No projections found.</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>Division</th>
          <th>Record</th>
          <th>Points</th>
          <th>Chances</th>
          <th>Targets</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row}
          <tr>
            <td>
              {#if row.slug}
                <a class="teamlink" href={`/playoffs-projection/${row.slug}`}>{row.teamName}</a>
              {:else}
                <span class="muted">{row.teamName}</span>
              {/if}
            </td>
            <td>{row.division}</td>
            <td>{row.wins}-{row.losses}-{row.ties}</td>
            <td>{row.points}</td>
            <td>{row.divStatus} {row.playStatus}</td>
            <td>{row.targets}{row.min ? ` (min ${row.min})` : ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
