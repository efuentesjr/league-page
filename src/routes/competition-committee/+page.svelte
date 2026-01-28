<script lang="ts">
  export const prerender = true;

  import { slide } from 'svelte/transition';

  type Proposal = {
    id: string; // ✅ was number
    title: string;
    owner: string;
    notes?: string;
    status: 'NEW' | 'YEARLY' | 'CARRIED' | 'REJECTED' | 'REVOTE' | 'OPEN';
  };

  type OutcomeStatus = 'Approved' | 'Rejected' | 'Enacted by Commish';

  type Outcome = {
    id?: number;
    title: string;
    ruleDeadline?: string | number;
    notes?: string;
    status?: OutcomeStatus;
    year?: number;
  };

  // --- Helpers ---------------------------------------------------------------
  function splitOptions(title: string): { base: string; options: string[] } {
    const re = /OPTION#\d+:\s*([\s\S]*?)(?=(?:\s*OPTION#\d+:|$))/g;
    const options: string[] = [];

    const firstIdx = title.search(/OPTION#\d+:/);
    const base = (firstIdx !== -1 ? title.slice(0, firstIdx) : title)
      .trim()
      .replace(/[.\s]+$/, '');

    let m: RegExpExecArray | null;
    while ((m = re.exec(title)) !== null) {
      options.push(m[1].trim().replace(/[.\s]+$/, ''));
    }
    return { base, options };
  }

  function hasValue(x: unknown): boolean {
    if (x === undefined || x === null) return false;
    return String(x).trim().length > 0;
  }

  const proposals: Proposal[] = [
    { id: '1', title: 'Review league scoring per owner(s) and yearly trends. Also, review players scoring, QB, RB, WR, TE', owner: 'Commish', notes: 'Section 4.1', status: 'YEARLY' },
    { id: '2', title: 'Allow punt return yards scoring (re-vote). OPTION#1: No. OPTION#2: Yes, the same as RB/WR, 10yrd=1pts (100yrd=10pts). OPTION#3: Yes, but less than RB/WR, 20yrd=1pts (100yrds=5pts). OPTION#4: Yes, but less than RB/WR, 30yrd=1pts (100yrds=3.33pts).', owner: 'John Diaz-Decaro', notes: 'Section 4.1', status: 'REVOTE' },
    { id: '3', title: 'Conditional trade rules. VOTE on whether we should allow or disallow conditional trading. OPTION#1: Yes, with clearly defined rules. OPTION#2: NO.', owner: 'Trey Fuentes', notes: 'Section 1.3', status: 'OPEN' },
    { id: '4', title: 'Player tags, "No trade back for top 35 players." Re-evaluate and reduce to OPTION#1: QBs 20. OPTION#2: RBs 20. OPTION#3: WRs 20. OPTION#4: TEs 10.', owner: 'Commish', status: 'REVOTE' },
    { id: '5', title: 'Allow teams to purchase a draft ping-pong entry for the #1 pick by way of FAAB. OPTION#1: Only allow 1 team. Hold an auction, winner gets one entry. OPTION#2: Only allow non-playoff teams. OPTION#3: Allow non-top 3 teams. OPTION#4: NO.', owner: 'Ray Rodriguez', status: 'NEW' },
    { id: '6', title: 'Allow teams to buy by way of FAAB the right to select division when reshuffling divisions. OPTION#1: ONLY one winner in a FAAB auction-type bidding.', owner: 'Eddie Fuentes / Ray Rodriguez', status: 'NEW' },
    { id: '7', title: 'Review bookkeeping (dues, winnings, etc.)', owner: 'Commish', notes: 'Section 7.2, 7.3', status: 'YEARLY' },
    { id: '8', title: 'Offer incentives for Divisional Champs. OPTION#1: $25 payout (would require league fee increase). OPTION#2: A bye week for the 1st round of playoffs (would require beginning playoffs WK13 or ending WK18). OPTION#3: $25 FAAB.', owner: 'Jordan Fristoe / Nick Bowens', status: 'NEW' },
    { id: '9', title: 'Raise dues ($75 → $85); 2/3 vote needed to raise fees, 11 owners. Commish to provide rationale.', owner: 'Commish', notes: 'Section 7.3', status: 'OPEN' },
    { id: '10', title: "When trading future picks you'll need to pay some additional $$$, in addition to regular fees and those fees will go towards that year's fees.", owner: 'John Diaz-DeCaro', status: 'NEW' },
    { id: '11', title: 'Waiver wire player "drop" restrictions and collusion prevention. OPTION#1: All players over 10 PPG. #OPTION#2: All players above 15 PPG. ', owner: 'Commish', status: 'NEW' },
    { id: '12', title: 'Open Market Trading. Allow a 24hrs period to permit league owners to counter all trades. OPTION#1: All trades. OPTION#2: Only trades involving draft picks.', owner: 'Eddie Fuentes', status: 'NEW' },
    { id: '13', title: 'Pay commissioners 25% of the total maximum FAAB allowed for that season.', owner: 'Commish', status: 'NEW' },
    { id: '14', title: 'Draw for 2026 draft order', owner: 'League', status: 'YEARLY' },
    { id: '15', title: 'Open forum: general fairness & league issues', owner: 'Commish', status: 'YEARLY' }
  ];

  const previous: Outcome[] = [
//    { id: 1, title: 'Allow punt return yards scoring (re-vote).', notes: 'Section 4.1', status: 'Approved', year: 2026 },
//    { id: 2, title: 'Conditional trade rules. VOTE on whether we should allow or disallow conditional trading.', notes: 'Section 1.3', status: 'Approved', year: 2026 },
//    { id: 3, title: 'Player tags, "No trade back for top 35 players.',  notes: 'Section 1.3.2', status: 'Approved', year: 2026 },
//    { id: 4, title: 'Allow teams to purchase a draft ping-pong entry for the #1 pick by way of FAAB.', status: 'Approved', year: 2026 },
//    { id: 5, title: 'Allow teams to buy by way of FAAB the right to select division when reshuffling divisions.', status: 'Approved', year: 2026 },
//    { id: 6, title: 'Offer incentives for Divisional Champs.', status: 'Approved', year: 2026 },
//    { id: 7, title: 'Raise dues ($75 → $85).', notes: 'Section 7.3', status: 'Approved', year: 2026 },
//    { id: 8, title: 'When trading future picks you will need to pay some additional $$$, in addition to regular fees and those fees will go towards that years fees.', status: 'Approved', year: 2026 },
//    { id: 9, title: 'Waiver wire player "drop" restrictions and collusion prevention.', status: 'Approved', year: 2026 },
//    { id: 10, title: 'Open Market Trading. Allow a 24hrs period to permit league owners to counter all trades.', status: 'Approved', year: 2026 },
//    { id: 11, title: 'Pay commissioners 25% of the total maximum FAAB allowed for that season.', status: 'Approved', year: 2026 },

    { id: 1, title: 'Change how ping pong balls are eraned. Toilet Bowl rules.', notes: 'Section 3.4', status: 'Approved', year: 2025 },
    { id: 2, title: 'Add Bonus 0.1 for RBs (40+ yard Rush TD)', notes: 'Section 4.1', status: 'Approved', year: 2025 },
    { id: 3, title: 'Decide draft order during Comp-Comittee every year..', notes: 'Section 3', status: 'Approved', year: 2025 },
    { id: 4, title: 'Loser’s punishment – 3 strike rule.', notes: 'Section 6.1', status: 'Approved', year: 2025 },
    { id: 5, title: 'Trade deadline moved to Wednesday of week 7- @8pm CST. This was approved to revote', notes: 'Section 1.3.3', status: 'Approved', year: 2025 },
    { id: 6, title: 'Reshuffle divisions every 4 years. Next reshuffle: 2028 offseason', notes: 'Section 1.2.2', status: 'Approved', year: 2025 },
    { id: 7, title: 'Manager replacement draft priority. New incoming manager may be given #1 draft pick, All 3 commish must approve', notes: 'Section 6.2', status: 'Enacted by Commish', year: 2025 },

    { id: 1, title: 'Top 35 “Pro Bowlers” no trade-back', notes: 'Section 1.3.2', status: 'Approved', year: 2024 },
    { id: 2, title: '“Best Roster” integrity rule', status: 'Rejected', year: 2024 },
    { id: 3, title: 'Starting 9 / Bench 10 / Taxi 4/ IR 3 settings', notes: 'Section 1.1', status: 'Approved', year: 2024 },
    { id: 4, title: 'Taxi squad move rules. Allowed "in/out" for true rookies and "in" for 2nd yr players.', notes: 'Defaulted to Sleeper settings', status: 'Approved', year: 2024 },
    { id: 5, title: 'Trade deadline moved to Week 7, midseason.', notes: 'Section 1.3.3', status: 'Approved', year: 2024 },
    { id: 6, title: 'Divisions. Move to a four divisions structure.', notes: 'Section 1.2.1', status: 'Approved', year: 2024 },
    { id: 7, title: 'Allow special teams (PR. KR) players TDs to count towards scoring.', notes: 'Section 4.1', status: 'Approved', year: 2024 },
    { id: 7, title: 'Allow special teams (PR. KR) players yards to count towards scoring.', notes: 'Section 4.1', status: 'Rejected', year: 2024 },
  ];

  // parse proposals
  const parsedProposals = proposals.map((p) => ({
    ...p,
    parsed: splitOptions(p.title)
  }));

  // parse previous outcomes
  const parsedPrevious = previous.map((o) => ({
    ...o,
    parsed: splitOptions(o.title)
  }));

  // --- GROUP PREVIOUS BY YEAR ---
  const grouped = Object.values(
    parsedPrevious.reduce((acc, item) => {
      const y = item.year ?? 0;
      if (!acc[y]) acc[y] = { year: y, items: [] };
      acc[y].items.push(item);
      return acc;
    }, {} as Record<number, { year: number; items: any[] }>)
  ).sort((a, b) => b.year - a.year); // newest first

  // collapsed state per year
  let openYears: Record<number, boolean> = {};

  function toggleYear(y: number) {
    openYears = { ...openYears, [y]: !openYears[y] }; // ✅ ensures reactivity
  }

  function previousChipClass(s?: OutcomeStatus) {
    if (s === 'Approved') return 'cc-chip--ok';
    if (s === 'Rejected') return 'cc-chip--bad';
    if (s === 'Enacted by Commish') return 'cc-chip--commish';
    return 'cc-chip--hold';
  }
</script>

<svelte:head>
  <title>Competition Committee</title>
</svelte:head>

<section class="cc-page">
  <header class="cc-header">
    <h1 class="cc-title">Competition Committee</h1>
    <p class="cc-subtitle">Active proposals and previous outcomes</p>
  </header>

  <!-- ACTIVE PROPOSALS -->
  <section class="cc-section cc-section--white">
    <h2 class="cc-section-title">2026 Active Proposed Rule Discussions</h2>
    <div class="cc-grid">
      {#each parsedProposals as p (p.id)}
        <article class="cc-card">
          <div class="cc-card-top">
            <span
              class={
                "cc-chip " +
                (p.status === 'NEW'
                  ? 'cc-chip--new'
                  : p.status === 'OPEN'
                  ? 'cc-chip--open'
                  : p.status === 'CARRIED'
                  ? 'cc-chip--ok'
                  : p.status === 'REJECTED'
                  ? 'cc-chip--bad'
                  : p.status === 'YEARLY'
                  ? 'cc-chip--yearly'
                  : p.status === 'REVOTE'
                  ? 'cc-chip--revote'
                  : 'cc-chip--hold')
              }
            >
              {p.status}
            </span>
            <span class="cc-id">#{p.id}</span>
          </div>

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

  <!-- PREVIOUS OUTCOMES (GROUPED & COLLAPSIBLE WITH SLIDE) -->
  <section class="cc-section cc-section--white">
    <h2 class="cc-section-title">Previous Outcomes of Rule Votes</h2>

    {#each grouped as g}
      <div class="cc-year-block">
        <button class="cc-year-toggle" on:click={() => toggleYear(g.year)}>
          <span>{g.year}</span>
          <span>{openYears[g.year] ? '▼' : '▶'}</span>
        </button>

        {#if openYears[g.year]}
          <div class="cc-grid" transition:slide>
            {#each g.items as o, i (o.id + '-' + i)}
              <article class="cc-card cc-card--sm">
                <div class="cc-card-top">
                  {#if o.status}
                    <span class={"cc-chip " + previousChipClass(o.status)}>
                      {o.status}{o.year ? ` ${o.year}` : ''}
                    </span>
                  {/if}
                </div>

                {#if hasValue(o.parsed.base)}
                  <h3 class="cc-card-title">
                    {o.parsed.base}{o.parsed.options.length ? ':' : ''}
                  </h3>
                {/if}

                {#if o.parsed.options.length}
                  <ul class="cc-bullets">
                    {#each o.parsed.options as opt}
                      <li>{opt}</li>
                    {/each}
                  </ul>
                {/if}

                {#if hasValue(o.ruleDeadline)}
                  <p class="cc-meta"><strong>Rule Deadline:</strong> {o.ruleDeadline}</p>
                {/if}

                {#if o.notes}<p class="cc-notes">{o.notes}</p>{/if}
              </article>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </section>
</section>

<style>
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

  .cc-section--white {
    background: #9b9b9b45;
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
    background: #ffffff;
    border: 1px solid #e7e7e7;
    border-radius: 10px;
    padding: 0.75rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .cc-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  }

  .cc-card--sm {
    font-size: 0.85rem;
  }

  .cc-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.35rem;
    min-height: 1.25rem;
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
    padding-left: 1.1rem;
    list-style: disc;
    color: #1f2937;
    font-size: 0.86rem;
  }

  .cc-bullets li {
    margin: 0.15rem 0;
  }

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

  .cc-chip--new  { background:#00efa6; color:#003a24; border-color:#00c987; }
  .cc-chip--open { background:#bcd8ff; color:#003f97; border-color:#82b7ff; }
  .cc-chip--ok   { background:#b9f6c5; color:#065f28; border-color:#7eea97; }
  .cc-chip--bad  { background:#ffb8b8; color:#7d0000; border-color:#ff7a7a; }
  .cc-chip--hold { background:#ffd9a0; color:#8a4900; border-color:#ffb865; }
  .cc-chip--commish { background:#d3ccff; color:#2b198c; border-color:#b3a8ff; }
  .cc-chip--yearly { background:#8af2ff; color:#004d57; border-color:#4de8ff; }
  .cc-chip--revote { background:#ffd57a; color:#6a3f00; border-color:#ffb733; }

  .cc-year-block {
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: #f7faff;
    border: 1px solid #d9e5ff;
  }

  .cc-year-toggle {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #dce9ff;
    border: 1px solid #bcd1ff;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 0.7rem;
  }
</style>
