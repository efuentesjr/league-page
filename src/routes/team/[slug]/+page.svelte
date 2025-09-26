<script>
  export let data = {};

  const title = data?.title ?? 'Team Name';
  const logoUrl = data?.logoUrl ?? '';
  const division = data?.division ?? '';

  const initials = (title || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
</script>

<a class="back" href="/playoffs-projection">← Back to Playoffs</a>

<header class="team-header">
  <div class="avatar-wrap" title={title}>
    {#if logoUrl}
      <img class="avatar" src={logoUrl} alt={`${title} logo`} />
    {:else}
      <div class="avatar avatar-fallback" aria-label={`${title} initials`}>{initials}</div>
    {/if}
  </div>

  <div class="title-block">
    <h1 class="team-title">{title}</h1>
    {#if division}
      <div class="subtle">Division: <strong>{division}</strong></div>
    {/if}
  </div>
</header>

<main class="grid">
  <section class="card">
    <h2>Team Overview</h2>
    <div class="kv">
      <div><span>Record</span><strong>—</strong></div>
      <div><span>Points For</span><strong>—</strong></div>
      <div><span>Points Against</span><strong>—</strong></div>
      <div><span>Strength of Schedule</span><strong>—</strong></div>
    </div>
  </section>

  <section class="card">
    <h2>Playoff Odds</h2>
    <div class="bars">
      <div class="bar">
        <div class="bar-label">Win Division</div>
        <div class="bar-track"><div class="bar-fill" style="width: 0%"></div></div>
        <div class="bar-value">—</div>
      </div>
      <div class="bar">
        <div class="bar-label">Make Playoffs</div>
        <div class="bar-track"><div class="bar-fill" style="width: 0%"></div></div>
        <div class="bar-value">—</div>
      </div>
      <div class="bar">
        <div class="bar-label">Win Championship</div>
        <div class="bar-track"><div class="bar-fill" style="width: 0%"></div></div>
        <div class="bar-value">—</div>
      </div>
    </div>
  </section>

  <section class="card span-2">
    <h2>Projection Breakdown</h2>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Min Wins</td><td>—</td><td>—</td></tr>
          <tr><td>Max Wins</td><td>—</td><td>—</td></tr>
          <tr><td>Playoff Target Wins</td><td>—</td><td>Typical threshold</td></tr>
          <tr><td>Division Target Wins</td><td>—</td><td>To secure division</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</main>

<style>
  :global(:root){
    --card-bg: hsl(0 0% 100% / 0.06);
    --card-border: hsl(0 0% 100% / 0.12);
    --muted: hsl(0 0% 100% / 0.65);
    --text: #fff;
    --accent: #3b82f6;
    --accent-weak: hsl(217 91% 60% / 0.2);
    --shadow: 0 10px 30px hsl(0 0% 0% / 0.35);
  }

  a.back{
    display:inline-block;
    margin: 10px 0 16px;
    text-decoration:none;
    color: var(--muted);
  }
  a.back:hover{ color: var(--text); }

  .team-header{
    display:flex;
    align-items:center;
    gap:18px;
    margin-bottom: 10px;
  }

  /* Default (desktop/tablet) avatar size */
  .avatar-wrap{
    position: relative;
    width: 120px;
    height: 120px;
    min-width: 120px;
  }
  .avatar{
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    object-fit: cover;
    border: 3px solid var(--accent);
    box-shadow: var(--shadow);
    background: #111;
  }
  .avatar-fallback{
    display:grid;
    place-items:center;
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    background: linear-gradient(135deg, var(--accent-weak), transparent);
    border: 3px solid var(--accent);
    font-weight: 800;
    font-size: 40px;
    color: var(--text);
    letter-spacing: 0.5px;
    text-shadow: 0 1px 0 rgba(0,0,0,.6);
  }

  .title-block{
    display:flex;
    flex-direction:column;
    gap:8px;
  }
  .team-title{
    font-size: clamp(26px, 4vw, 40px);
    margin:0;
    line-height: 1.05;
  }
  .subtle{
    color: var(--muted);
    font-size: 1rem;
  }

  /* Mobile tweaks: bigger avatar + slightly smaller title to balance */
  @media (max-width: 480px){
    .team-header{
      gap:14px;
    }
    .avatar-wrap{
      width: 150px;
      height: 150px;
      min-width: 150px;
    }
    .avatar-fallback{
      font-size: 50px;
    }
    .team-title{
      font-size: clamp(22px, 7vw, 34px);
      line-height: 1.08;
    }
  }

  .grid{
    display:grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 860px){
    .grid{
      grid-template-columns: 1fr 1fr;
    }
    .span-2{
      grid-column: span 2;
    }
  }

  .card{
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 16px;
    box-shadow: var(--shadow);
  }
  .card h2{
    margin: 0 0 12px;
    font-size: 1.1rem;
    letter-spacing: .2px;
  }

  .kv{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }
  .kv > div{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding: 10px 12px;
    background: hsl(0 0% 100% / 0.03);
    border: 1px solid var(--card-border);
    border-radius: 12px;
  }
  .kv span{
    color: var(--muted);
    font-size: .95rem;
  }
  .kv strong{
    font-weight: 700;
  }

  .bars{
    display:flex;
    flex-direction:column;
    gap: 12px;
  }
  .bar{
    display:grid;
    grid-template-columns: 140px 1fr auto;
    align-items:center;
    gap: 10px;
  }
  .bar-label{
    color: var(--muted);
    font-size: .95rem;
  }
  .bar-track{
    height: 10px;
    border-radius: 999px;
    background: hsl(0 0% 100% / 0.08);
    overflow:hidden;
    border: 1px solid var(--card-border);
  }
  .bar-fill{
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--accent), #60a5fa);
  }
  .bar-value{
    min-width: 42px;
    text-align:right;
    font-variant-numeric: tabular-nums;
  }

  .table-wrap{
    overflow:auto;
    border-radius: 12px;
    border: 1px solid var(--card-border);
  }
  table.table{
    width: 100%;
    border-collapse: collapse;
    background: hsl(0 0% 100% / 0.02);
  }
  .table thead th{
    text-align:left;
    font-weight: 700;
    padding: 10px 12px;
    border-bottom: 1px solid var(--card-border);
  }
  .table tbody td{
    padding: 10px 12px;
    border-top: 1px solid var(--card-border);
  }
</style>
