<script lang="ts">
  import { slide } from 'svelte/transition';
  import Ballot from '$lib/Committee/Ballot.svelte';

  type Proposal = {
    id: string; // ✅ was number
    title: string;
    owner: string;
    notes?: string;
    status: 'NEW' | 'YEARLY' | 'CARRIED' | 'REJECTED' | 'REVOTE' | 'OPEN' | 'HOLD';
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
    { id: '1', title: 'League announcements.', owner: 'Commish', status: 'YEARLY' },
    { id: '2', title: 'Review league scoring per owner(s) and yearly trends. Also, review players scoring, QB, RB, WR, TE... Specifically review QB interceptions and sacks', owner: 'Commish', notes: 'Section 4.1', status: 'YEARLY' },
    { id: '3', title: 'Review bookkeeping (dues, winnings, etc.)', owner: 'Commish', notes: 'Section 7.2, 7.3', status: 'YEARLY' },
    { id: '4', title: 'Raise dues ($100). OPTION#1: We agreed to review it again and decide whether we should leave it as is or decrease it.', owner: 'Commish', notes: 'Section 7.3', status: 'OPEN' },
    { id: '5', title: 'Open Market Trading. Allow a 24hrs period to permit league owners to counter all trades. OPTION#1: All trades. OPTION#2: Only trades involving draft picks.', owner: 'Eddie Fuentes', status: 'HOLD' },
    { id: '6', title: 'League expansion analysis report', owner: 'Commish, John David', status: 'NEW' },
    { id: '7', title: 'Draw for 2027 draft order', owner: 'League', status: 'YEARLY' },
    { id: '8', title: 'Open forum: general fairness & league issues', owner: 'Commish', status: 'YEARLY' }
  ];

  const previous: Outcome[] = [
    // 2026 placeholders (commented)
    { id: 1, title: 'Allow punt return yards scoring (20yrd=1pts).', notes: 'Section 4.1', status: 'Approved', year: 2026 },
    { id: 2, title: 'Player tags, No trade back for top 50 players.', notes: '', status: 'Approved', year: 2026 },
    { id: 3, title: 'Conditional trade rules. VOTE on whether we should allow or disallow conditional trading.', notes: 'Section 1.3', status: 'Approved', year: 2026 },
    { id: 4, title: 'Allow teams to purchase a draft ping-pong entry for the #1 pick by way of FAAB. Only non-playoff teams', status: 'Approved', year: 2026 },
    { id: 5, title: 'Allow teams to buy by way of FAAB the right to select division when reshuffling divisions. One team only.', notes: '', status: 'Approved', year: 2026 },
    { id: 6, title: 'Offer incentives for Divisional Champs.($25)', status: 'Approved', year: 2026 },
    { id: 7, title: 'Payout for the 3rd place runner-up.', notes: 'Section 7.3', status: 'Rejected', year: 2026 },
    { id: 8, title: 'Raise dues ($100).', notes: 'Section 7.3', status: 'Approved', year: 2026 },
    { id: 9, title: 'When trading future picks you will need to pay some additional $$$, in addition to regular fees and those fees will go towards that years fees.', status: 'Rejected', year: 2026 },
    { id: 10, title: 'Waiver wire player drop restrictions and collusion prevention.', status: 'Rejected', year: 2026 },
    { id: 11, title: 'Pay commissioners 25% of the total maximum FAAB allowed for that season.', status: 'Approved', year: 2026 },

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
    { id: 7, title: 'Allow special teams (PR. KR) players yards to count towards scoring.', notes: 'Section 4.1', status: 'Rejected', year: 2024 }
  ];

  // parse proposals
  const parsedProposals = proposals.map((p) => ({
    ...p,
    parsed: splitOptions(p.title)
  }));

  // Committee Night results saved on the site join the history automatically
  const BALLOT_SEASON = 2027;
  let liveOutcomes: Outcome[] = [];
  const onBallotResults = (closed: any[]) => {
    liveOutcomes = closed.map((p, i) => {
      const yesNo = p.options.length === 2 && p.options[0] === 'Yes' && p.options[1] === 'No';
      const counts = (p.options as string[]).map((o: string, k: number) => `${o} ${p.result?.counts?.[k] ?? 0}`).join(' · ');
      const chosen = !yesNo && p.type === 'regular' && p.result?.winner != null ? ` Chosen: ${p.options[p.result.winner]}.` : '';
      return {
        id: 1000 + i,
        title: `${p.title}${chosen}`,
        notes: [p.ref, counts, p.result?.tieBroken ? 'tie broken by commissioner' : ''].filter(Boolean).join(' · '),
        status: p.result?.passed === false ? 'Rejected' : 'Approved',
        year: Number(p.season)
      } as Outcome;
    });
  };

  // parse previous outcomes
  $: parsedPrevious = [...liveOutcomes, ...previous].map((o) => ({
    ...o,
    parsed: splitOptions(o.title)
  }));

  // --- GROUP PREVIOUS BY YEAR ---
  $: grouped = Object.values(
    parsedPrevious.reduce((acc, item) => {
      const y = item.year ?? 0;
      if (!acc[y]) acc[y] = { year: y, items: [] };
      acc[y].items.push(item);
      return acc;
    }, {} as Record<number, { year: number; items: any[] }>)
  ).sort((a, b) => b.year - a.year); // newest first

  // collapsed state per year (most recent year starts open)
  let openYears: Record<number, boolean> = { [Math.max(...previous.map((o) => o.year ?? 0))]: true };

  const tally = (items: any[]) => ({
    approved: items.filter((o) => o.status === 'Approved' || o.status === 'Enacted by Commish').length,
    rejected: items.filter((o) => o.status === 'Rejected').length
  });
  $: allTime = tally([...liveOutcomes, ...previous]);

  const proposalTone = (s: Proposal['status']) =>
    ({ NEW: 'new', OPEN: 'open', CARRIED: 'ok', REJECTED: 'bad', YEARLY: 'yearly', REVOTE: 'hold', HOLD: 'hold' })[s] || 'yearly';
  const proposalLabel = (s: Proposal['status']) =>
    ({ NEW: 'New', OPEN: 'Open', CARRIED: 'Carried', REJECTED: 'Rejected', YEARLY: 'Yearly', REVOTE: 'Revote', HOLD: 'On hold' })[s] || s;

  function toggleYear(y: number) {
    openYears = { ...openYears, [y]: !openYears[y] }; // ✅ ensures reactivity
  }

  function outcomeTone(s?: OutcomeStatus) {
    if (s === 'Approved') return 'ok';
    if (s === 'Rejected') return 'bad';
    if (s === 'Enacted by Commish') return 'commish';
    return 'hold';
  }
</script>

<svelte:head>
  <title>Competition Committee</title>
</svelte:head>

<section class="cc-page">
  <header class="cc-header">
    <div>
      <h1 class="cc-title">Competition Committee</h1>
      <p class="cc-subtitle">Rule proposals on the table, and how past votes went</p>
    </div>
    <div class="cc-stats">
      <div class="cc-stat"><strong>{proposals.length}</strong><span>On the table</span></div>
      <div class="cc-stat ok"><strong>{allTime.approved}</strong><span>Passed</span></div>
      <div class="cc-stat bad"><strong>{allTime.rejected}</strong><span>Voted down</span></div>
    </div>
  </header>

  <!-- COMMITTEE NIGHT VOTING -->
  <Ballot cards={parsedProposals} season={BALLOT_SEASON} onresults={onBallotResults} />

  <!-- ACTIVE PROPOSALS -->
  <div class="cc-sectionHead">
    <h2>2027 Proposals</h2>
    <span>Up for discussion at the next meeting</span>
  </div>
  <div class="cc-grid">
    {#each parsedProposals as p (p.id)}
      <article class="cc-card tone-{proposalTone(p.status)}">
        <div class="cc-card-top">
          <span class="cc-chip">{proposalLabel(p.status)}</span>
          <span class="cc-id">#{p.id}</span>
        </div>

        <h3 class="cc-card-title">{p.parsed.base}</h3>

        {#if p.parsed.options.length}
          <ol class="cc-options">
            {#each p.parsed.options as opt, i}
              <li><span class="cc-optNum">Option {i + 1}</span>{opt}</li>
            {/each}
          </ol>
        {/if}

        <div class="cc-foot">
          <span class="cc-owner"><span class="cc-footLabel">Owner</span>{p.owner}</span>
          {#if p.notes}<span class="cc-ref">{p.notes}</span>{/if}
        </div>
      </article>
    {/each}
  </div>

  <!-- PREVIOUS OUTCOMES -->
  <div class="cc-sectionHead">
    <h2>Past Votes</h2>
    <span>Tap a year to open it</span>
  </div>

  {#each grouped as g}
    {@const t = tally(g.items)}
    <div class="cc-year" class:open={openYears[g.year]}>
      <button type="button" class="cc-year-toggle" aria-expanded={!!openYears[g.year]} on:click={() => toggleYear(g.year)}>
        <span class="cc-yearName">{g.year}<span class="cc-chevron" aria-hidden="true">▸</span></span>
        <span class="cc-yearTally">
          <span class="ok">{t.approved} passed</span>
          <span class="bad">{t.rejected} voted down</span>
        </span>
      </button>

      {#if openYears[g.year]}
        <div class="cc-grid cc-grid--past" transition:slide>
          {#each g.items as o, i (o.id + '-' + i)}
            <article class="cc-card cc-card--sm tone-{outcomeTone(o.status)}">
              <div class="cc-card-top">
                {#if o.status}<span class="cc-chip">{o.status === 'Enacted by Commish' ? 'Enacted by commish' : o.status}</span>{/if}
              </div>

              {#if hasValue(o.parsed.base)}
                <h3 class="cc-card-title">{o.parsed.base}</h3>
              {/if}

              {#if o.parsed.options.length}
                <ol class="cc-options">
                  {#each o.parsed.options as opt, i}
                    <li><span class="cc-optNum">Option {i + 1}</span>{opt}</li>
                  {/each}
                </ol>
              {/if}

              {#if hasValue(o.ruleDeadline) || o.notes}
                <div class="cc-foot">
                  {#if hasValue(o.ruleDeadline)}<span class="cc-owner"><span class="cc-footLabel">Deadline</span>{o.ruleDeadline}</span>{/if}
                  {#if o.notes}<span class="cc-ref">{o.notes}</span>{/if}
                </div>
              {/if}
            </article>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</section>

<style>
  /* ============================================================
     COMPETITION COMMITTEE — same panel language as the home page
     ============================================================ */
  .cc-page {
    width: 96%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 22px 0 50px;
    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    color: var(--mf-text);
  }

  .cc-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 20px 20px 18px;
    background:
      linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
      linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
      radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
      var(--mf-bg);
    border: 1px solid var(--mf-line);
    clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
  }

  .cc-title {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.02em;
    color: var(--mf-text);
    text-shadow: 0 0 18px var(--mf-line-strong);
  }

  .cc-subtitle {
    margin: 6px 0 0;
    font-size: 0.85rem;
    color: var(--mf-dim);
  }

  .cc-stats {
    display: flex;
    gap: 8px;
  }

  .cc-stat {
    --tone: var(--mf-ion);
    min-width: 84px;
    padding: 8px 12px;
    background: var(--mf-panel);
    border: 1px solid var(--mf-line);
    border-top: 2px solid var(--tone);
    text-align: center;
  }

  .cc-stat strong {
    display: block;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--tone);
    font-variant-numeric: tabular-nums;
  }

  .cc-stat span {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--mf-dim);
  }

  .cc-stat.ok { --tone: var(--mf-up); }
  .cc-stat.bad { --tone: var(--mf-down); }

  .cc-sectionHead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin: 34px 4px 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--mf-line);
  }

  .cc-sectionHead h2 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.02em;
    color: var(--mf-text);
    text-shadow: 0 0 18px var(--mf-line-strong);
  }

  .cc-sectionHead span {
    font-size: 0.82rem;
    color: var(--mf-dim);
  }

  .cc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    gap: 12px;
  }

  .cc-grid--past {
    padding: 12px;
  }

  /* status tones */
  .tone-new     { --tone: var(--mf-ion); }
  .tone-open    { --tone: #58a7ff; }
  .tone-ok      { --tone: var(--mf-up); }
  .tone-bad     { --tone: var(--mf-down); }
  .tone-hold    { --tone: #e0b03a; }
  .tone-yearly  { --tone: var(--mf-plasma); }
  .tone-commish { --tone: #e5b52a; }

  .cc-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 14px 12px;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--tone) 12%, transparent), transparent 45%),
      var(--mf-panel);
    border: 1px solid var(--mf-line);
    border-left: 3px solid var(--tone);
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .cc-card:hover {
    background-color: var(--mf-panel-2);
    border-top-color: var(--mf-line-strong);
    border-right-color: var(--mf-line-strong);
    border-bottom-color: var(--mf-line-strong);
  }

  .cc-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 1.2rem;
  }

  .cc-chip {
    padding: 1px 7px;
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--tone);
    border: 1px solid currentColor;
    background: color-mix(in srgb, var(--tone) 10%, transparent);
  }

  .cc-id {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--mf-dim);
    font-variant-numeric: tabular-nums;
  }

  .cc-card-title {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--mf-text);
  }

  .cc-card--sm .cc-card-title {
    font-size: 0.9rem;
  }

  .cc-options {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .cc-options li {
    padding: 6px 8px;
    font-size: 0.84rem;
    line-height: 1.35;
    background: var(--mf-panel-2);
    border: 1px solid var(--mf-line);
  }

  .cc-optNum {
    display: block;
    margin-bottom: 2px;
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--mf-ion);
  }

  .cc-foot {
    margin-top: auto;
    padding-top: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    border-top: 1px solid var(--mf-line);
    font-size: 0.78rem;
  }

  .cc-owner {
    color: var(--mf-text);
  }

  .cc-footLabel {
    margin-right: 6px;
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--mf-dim);
  }

  .cc-ref {
    padding: 1px 6px;
    font-size: 0.72rem;
    color: var(--mf-dim);
    border: 1px solid var(--mf-line-strong);
  }

  /* past years: collapsible bars, same as Draft History */
  .cc-year {
    margin-bottom: 10px;
    background: var(--mf-bg);
    border: 1px solid var(--mf-line);
  }

  .cc-year.open {
    border-color: var(--mf-line-strong);
  }

  .cc-year-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    font: inherit;
    color: var(--mf-text);
    background: linear-gradient(90deg, color-mix(in srgb, var(--mf-ion) 10%, transparent), transparent 60%), var(--mf-panel);
    border: 0;
    cursor: pointer;
    text-align: left;
  }

  .cc-year-toggle:hover,
  .cc-year-toggle:focus-visible {
    background-color: var(--mf-panel-2);
    outline: none;
  }

  .cc-year-toggle:focus-visible {
    box-shadow: inset 0 0 0 2px var(--mf-ion);
  }

  .cc-yearName {
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1;
  }

  .cc-chevron {
    display: inline-block;
    margin-left: 8px;
    color: var(--mf-ion);
    transition: transform 0.15s ease;
  }

  .open .cc-chevron {
    transform: rotate(90deg);
  }

  .cc-yearTally {
    display: flex;
    gap: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .cc-yearTally .ok { color: var(--mf-up); }
  .cc-yearTally .bad { color: var(--mf-down); }

  @media (max-width: 600px) {
    .cc-page { width: calc(100% - 16px); }
    .cc-title { font-size: 1.6rem; }
    .cc-stats { width: 100%; }
    .cc-stat { flex: 1; min-width: 0; }
    .cc-sectionHead h2 { font-size: 1.3rem; }
    .cc-sectionHead span { display: none; }
    .cc-yearTally { flex-direction: column; gap: 2px; align-items: flex-end; font-size: 0.72rem; }
    .cc-grid--past { padding: 8px; }
  }
</style>
