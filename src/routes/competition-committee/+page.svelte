<script lang="ts">
  export const prerender = true;

  type Proposal = {
    id: number;
    title: string;
    owner: string;
    notes?: string;
    status: string;
  };

  type Outcome = {
    title: string;
    ruleDeadline?: string | number;
    notes?: string;
  };

  const proposals: Proposal[] = [
    { id: 1, title: 'Review bookkeeping (dues, winnings, etc.)', owner: 'Commish', notes: 'Section 7.2, 7.3', status: 'OPEN' },
    { id: 2, title: 'Review player scoring', owner: 'Commish', notes: 'Section 4.1', status: 'OPEN' },
    { id: 3, title: 'Draw for draft order', owner: 'League', status: 'OPEN' },
    { id: 4, title: 'Draft “ping-pong” entry for #1 spot via FAAB', owner: 'Ray Rodriguez', status: 'NEW' },
    { id: 5, title: 'Buy FAAB right to select division when joining', owner: 'Eddie Fuentes / Ray Rodriguez', status: 'NEW' },
    { id: 6, title: 'Run draft in an auction-type bidding format', owner: 'Commish', status: 'OPEN' },
    { id: 7, title: 'Reduce Pro Bowlers list size / counts', owner: 'Commish', notes: 'Section 13.2', status: 'OPEN' },
    { id: 8, title: 'Punt return yards scoring (vote)', owner: 'John Diaz-Decaro', notes: 'Section 4.1', status: 'OPEN' },
    { id: 9, title: 'Raise dues (75 → 85); 2/3 vote', owner: 'Commish', notes: 'Section 7.3', status: 'OPEN' },
    { id: 10, title: 'Conditional trade rules / FAAB limits', owner: 'Trey Fuentes', notes: 'Section 13', status: 'OPEN' },
    { id: 11, title: 'Open forum: general fairness & league issues', owner: 'Commish', status: 'OPEN' }
  ];

  const previous: Outcome[] = [
    { title: 'Top 3 “Pro Bowlers” no trade-back', ruleDeadline: 2025, notes: 'Reduce to top 20 or 25' },
    { title: '“Best Roster” integrity rule', ruleDeadline: 2025, notes: 'Rejected' },
    { title: 'Starting / Bench / Taxi / IR settings', ruleDeadline: 2025, notes: '3 | 10 | 3 | 4' },
    { title: 'Taxi squad move rules', ruleDeadline: 2025, notes: 'Updated mid-season timing' },
    { title: 'Trade deadline moved to Week 7', ruleDeadline: 2026 },
    { title: 'Divisions reshuffling cadence', ruleDeadline: 2026 },
    { title: 'Toilet Bowl rules', ruleDeadline: 2026 },
    { title: 'Manager replacement draft priority', ruleDeadline: 2027 },
    { title: 'Loser’s punishment – 2 strike rule', ruleDeadline: 2027 },
    { title: 'Reshuffle divisions every 4 years', ruleDeadline: 2027, notes: 'Next reshuffle: 2028 offseason' }
  ];
</script>

<svelte:head>
  <title>Competition Committee</title>
</svelte:head>

<section class="page">
  <h1 class="title">🏛️ 2026 Competition Committee</h1>
  <p class="subtitle">Active proposals and previous outcomes for the MFFL</p>

  <!-- ACTIVE PROPOSALS -->
  <div class="category">
    <h2 class="cat-header">Active Rule Discussions</h2>
    <div class="card-grid">
      {#each proposals as p}
        <article class="card">
          <div class="card-top">
            <div class="tag {p.status === 'NEW' ? 'new' : 'open'}">{p.status}</div>
            <span class="id">#{p.id}</span>
          </div>
          <h3 class="card-title">{p.title}</h3>
          <p class="meta"><strong>Owner:</strong> {p.owner}</p>
          {#if p.notes}<p class="notes">{p.notes}</p>{/if}
        </article>
      {/each}
    </div>
  </div>

  <!-- PREVIOUS OUTCOMES -->
  <div class="category">
    <h2 class="cat-header">Previous Outcomes & Notes</h2>
    <div class="card-grid">
      {#each previous as o}
        <article class="card small">
          <h3 class="card-title">{o.title}</h3>
          <p class="meta"><strong>Rule Deadline:</strong> {o.ruleDeadline ?? '—'}</p>
          {#if o.notes}<p class="notes">{o.notes}</p>{/if}
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  :global(body) {
    background: #f8f9fb;
    font-family: system-ui, sans-serif;
  }

  .page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
  }

  .title {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.2rem;
    text-align: center;
  }

  .subtitle {
    text-align: center;
    color: #777;
    font-size: 0.85rem;
    margin-bottom: 2rem;
  }

  .category {
    margin-bottom: 2.5rem;
  }

  .cat-header {
    font-size: 1rem;
    font-weight: 600;
    border-left: 4px solid #0047ab;
    padding-left: 0.5rem;
    margin-bottom: 1rem;
    color: #222;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    border: 1px solid #eee;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }

  .card.small {
    font-size: 0.85rem;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.3rem;
  }

  .id {
    font-size: 0.7rem;
    color: #aaa;
  }

  .card-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #222;
    line-height: 1.3;
    margin-bottom: 0.4rem;
  }

  .meta {
    font-size: 0.78rem;
    color: #555;
    margin-bottom: 0.25rem;
  }

  .notes {
    font-size: 0.75rem;
    color: #666;
  }

  .tag {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .tag.open {
    background: #e8f0ff;
    color: #0047ab;
  }

  .tag.new {
    background: #fff4db;
    color: #b36b00;
  }
</style>
