<script lang="ts">
  export const prerender = true;

  type Proposal = {
    id: number;
    title: string;
    owner: string;
    notes?: string;
    status: 'NEW' | 'OPEN' | 'CARRIED' | 'REJECTED' | 'TABLED';
  };

  type Outcome = {
    title: string;
    ruleDeadline?: string | number;
    notes?: string;
  };

  // --- Helpers ---------------------------------------------------------------
  function splitOptions(title: string): { base: string; options: string[] } {
    // capture OPTION#N: ... segments (non-greedy until next OPTION or end)
    const re = /OPTION#\d+:\s*([\s\S]*?)(?=(?:\s*OPTION#\d+:|$))/g;
    const options: string[] = [];

    const firstIdx = title.search(/OPTION#\d+:/);
    const base = (firstIdx !== -1 ? title.slice(0, firstIdx) : title).trim().replace(/[.\s]+$/, '');

    let m: RegExpExecArray | null;
    while ((m = re.exec(title)) !== null) {
      options.push(m[1].trim().replace(/[.\s]+$/, ''));
    }
    return { base, options };
  }

  const proposals: Proposal[] = [
    { id: 1, title: 'Review bookkeeping (dues, winnings, etc.)', owner: 'Commish', notes: 'Section 7.2, 7.3', status: 'OPEN' },
    { id: 2, title: 'Raise dues ($75 → $85); 2/3 vote needed to raise fees, 11 owners. Commish to provide rationale.', owner: 'Commish', notes: 'Section 7.3', status: 'OPEN' },
    { id: 3, title: 'Draw for 2026 draft order', owner: 'League', status: 'OPEN' },
    { id: 4, title: 'VOTE to allow teams to purchase a draft ping-pong entry for the #1 pick by way of FAAB. OPTION#1: Only allow 1 team. Hold an auction, winner gets one entry. OPTION#2: Only allow non-playoff teams. OPTION#3: Allow non-top 3 teams.', owner: 'Ray Rodriguez', status: 'NEW' },
    { id: 5, title: 'Allow teams to buy by way of FAAB, the right to select division when reshuffling divisions. OPTION#1: ONLY one winner in a FAAB auction type bidding.', owner: 'Eddie Fuentes / Ray Rodriguez', status: 'NEW' },
    { id: 7, title: 'Review players scoring, QB, RB, WR, TE', owner: 'Commish', notes: 'Section 4.1', status: 'OPEN' },
    { id: 8, title: 'Punt return yards scoring (re-vote)', owner: 'John Diaz-Decaro', notes: 'Section 4.1', status: 'OPEN' },
    { id: 9, title: 'Player tags, "No trade back for top 35 players." Re-evaluate and reduce to OPTION#1: QBs 16. OPTION#2: RBs 20. OPTION#3: WRs 25. OPTION#4: TEs 10.', owner: 'Commish', status: 'OPEN' },
    { id: 10, title: 'Conditional trade rules. VOTE on whether we should allow or disallow conditional trading. OPTION#1: Limit to FAAB. OPTION#2: No trade backs on all players involved. OPTION#3: When a trade involves pick only or non impact players, it must be offered to the entire league.', owner: 'Trey Fuentes', notes: 'Section 13', status: 'OPEN' },
    { id: 11, title: 'When trading future picks you\'ll need to pay some additiona $$$, in addition to regular fees and those fees will goes towards that years fees', owner: 'John Diaz-DeCaro', status: 'NEW' },
    { id: 12, title: 'Open forum: general fairness & league issues', owner: 'Commish', status: 'OPEN' }
  ];

  const previous: Outcome[] = [
    { title: 'Top 35 “Pro Bowlers” no trade-back', ruleDeadline: 2025, notes: 'Approved' },
    { title: '“Best Roster” integrity rule', ruleDeadline: 2025, notes: 'Rejected' },
    { title: 'Starting 9 / Bench 10 / Taxi 4/ IR 3 settings', ruleDeadline: 2025, notes: 'Approved' },
    { title: 'Taxi squad move rules. Allowed "in/out" for true rookies and "in" for 2nd yr players.', ruleDeadline: 2025, notes: 'Defaulted to Sleeper settings' },
    { title: 'Trade deadline moved to Week 7, midseason.', ruleDeadline: 2026 },
    { title: 'Divisions', OPTION#1: Move to a four divisions structure. ruleDeadline: 2026, notes: 'Approved' },
    { title: 'Reshuffle divisions every 4 years. Next reshuffle: 2028 offseason', ruleDeadline: 2027, notes: 'Approved' },
    { title: 'Toilet Bowl rules', ruleDeadline: 2027, notes: 'Approved' },
    { title: 'Manager replacement draft priority', ruleDeadline: 2027, notes: 'Enacted by Commish powers' },
    { title: 'Loser’s punishment – 2 strike rule', ruleDeadline: 2027, notes: 'Enacted by Commish powers' }
  ];

  // Precompute parsed proposals (avoid {#await} for sync work)
  const parsedProposals = proposals.map((p) => ({
    ...p,
    parsed: splitOptions(p.title)
  }));
</script>

<svelte:head>
  <title>Competition Committee</title>
</svelte:head>

<section class="cc-page">
  <header class="cc-header">
    <h1 class="cc-title">2026 Competition Committee</h1>
    <p class="cc-subtitle">Active proposals and previous outcomes</p>
  </header>

  <!-- ACTIVE -->
  <section class="cc-section cc-section--white">
    <h2 class="cc-section-title">2026 Active Proposed Rule Discussions</h2>
    <div class="cc-grid">
      {#each parsedProposals as p (p.id)}
        <article class="cc-card">
          <div class="cc-card-top">
            <span class={"cc-chip " + (p.status === 'NEW' ? 'cc-chip--new' :
                                        p.status === 'OPEN' ? 'cc-chip--open' :
                                        p.status === 'CARRIED' ? 'cc-chip--ok' :
                                        p.status === 'REJECTED' ? 'cc-chip--bad' : 'cc-chip--hold')}>
              {p.status}
            </span>
            <span class="cc-id">#{p.id}</span>
          </div>

          <!-- Title becomes the base statement; options go as bullets if present -->
          <h3 class="cc-card-title">
            {p.parsed.base}{p.parsed.options.length ? ':' : ''}
          </h3>

          {#if p.parsed.options.length}
            <ul class="cc-bullets">
              {#each p.parsed.options as opt}
                <li>{opt}</li>
              {/each}
            </ul>
          {/if}

          <p class="cc-meta"><strong>Owner:</strong> {p.owner}</p>
          {#if p.notes}<p class="cc-notes">{p.notes}</p>{/if}
        </article>
      {/each}
    </div>
  </section>

  <!-- PREVIOUS -->
  <section class="cc-section cc-section--white">
    <h2 class="cc-section-title">Previous Outcomes of VOTES</h2>
    <div class="cc-grid">
      {#each previous as o, i (i)}
        <article class="cc-card cc-card--sm">
          <h3 class="cc-card-title">{o.title}</h3>
          <p class="cc-meta"><strong>Rule Deadline:</strong> {o.ruleDeadline ?? '—'}</p>
          {#if o.notes}<p class="cc-notes">{o.notes}</p>{/if}
        </article>
      {/each}
    </div>
  </section>
</section>

<style>
  /* ---------- Scoped, safe, and contained ---------- */

  .cc-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.25rem 1rem 2.5rem;
  }

  .cc-header {
    text-align: center;
    margin-bottom: 1.25rem;
  }

  .cc-title {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 0.15rem 0;
    letter-spacing: 0.2px;
  }

  .cc-subtitle {
    font-size: 0.8rem;
    color: #6b7280;
    margin: 0;
  }

  .cc-section {
    margin-top: 1.25rem;
    border-radius: 12px;
    padding: 1rem;
  }

  /* Outer large box color → light blue */
  .cc-section--white {
    background: #e9f3ff; /* Light blue */
    box-shadow: 0 1px 4px rgba(0,0,255,1);
    border: 1px solid #d1e4ff;
  }

  .cc-section-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #222;
    margin: 0 0 0.6rem 0;
    padding-left: 0.5rem;
    border-left: 4px solid #0b4eb3;
    line-height: 1.2;
  }

  .cc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.75rem;
  }

  .cc-card {
    background: #ffffff; /* inner small boxes remain white */
    border: 1px solid #e7e7e7;
    border-radius: 10px;
    padding: 0.75rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .cc-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  }

  .cc-card--sm { font-size: 0.85rem; }

  .cc-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.35rem;
  }

  .cc-id {
    font-size: 0.7rem;
    color: #9aa0a6;
  }

  .cc-card-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0.15rem 0 0.3rem;
    line-height: 1.25;
  }

  .cc-bullets {
    margin: 0.25rem 0 0.4rem;
    padding-left: 1.1rem;      /* indent */
    list-style: disc;
    color: #1f2937;
    font-size: 0.86rem;
  }
  .cc-bullets li { margin: 0.15rem 0; }

  .cc-meta {
    font-size: 0.78rem;
    color: #4b5563;
    margin: 0.25rem 0 0.2rem 0;
  }

  .cc-notes {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }

  .cc-chip {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.18rem 0.55rem;
    border-radius: 999px;
    border: 1px solid;
    letter-spacing: 0.02em;
  }

  .cc-chip--new  { background:#fff4db; color:#8b5b00; border-color:#f6dfaa; }
  .cc-chip--open { background:#eaf2ff; color:#0b4eb3; border-color:#cfdcfd; }
  .cc-chip--ok   { background:#e8f7ed; color:#197a45; border-color:#cfeedd; }
  .cc-chip--bad  { background:#ffecec; color:#b42318; border-color:#ffd1d1; }
  .cc-chip--hold { background:#fff3e8; color:#b25e09; border-color:#ffd9b8; }
</style>
