<script>
  import { dues } from '$lib/utils/helper';

  let one, oneOne, oneOneOne; // 1.1 Positional Breakdown
  let oneTwo, oneTwoOne, oneTwoTwo, oneTwoThree; // 1.2 Divisions
  let oneThree, oneThreeOne, oneThreeTwo, oneThreeThree, oneThreeFour, oneThreeFive, oneThreeSix; // 1.3 Trading
  let oneFour, oneFourOne; // 1.4 Waiver Wire
  let two, twoOne; // 2.1 Playoffs
  let three, threeOne, threeTwo, threeThree, threeFour, threeFive; // 3. Drafting
  let four, fourOne; // 4. Scoring System
  let five, fiveOne; // 5. Tanking Policy
  let six, sixOne, sixTwo, sixThree; // 6. Replacing Managers
  let seven, sevenOne, sevenTwo, sevenThree; // 7. League Finances

  const goToSection = (section) => {
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({ left: 0, top, behavior: 'smooth' });
  };
</script>

<style>
  /* ============================================================
     CONSTITUTION — same panel language as the rest of the site.
     Everything is scoped to .constitution-shell so nothing leaks.
     ============================================================ */
  .constitution-shell {
    width: min(980px, 92%);
    margin: 2.2rem auto 6rem;
    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    color: var(--mf-text);
  }

  .constitution-shell :global(h1),
  .constitution-shell :global(h2),
  .constitution-shell :global(h3),
  .constitution-shell :global(h4),
  .constitution-shell :global(h5) {
    color: var(--mf-text);
    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
  }

  .constitution-shell :global(p),
  .constitution-shell :global(li) {
    color: color-mix(in srgb, var(--mf-text) 82%, var(--mf-dim));
    line-height: 1.62;
  }

  .constitution-shell :global(p) {
    margin: 0.6rem 0 0.9rem;
  }

  .constitution-shell :global(ul),
  .constitution-shell :global(ol) {
    padding-left: 1.2rem;
    margin: 0.5rem 0 0.95rem;
  }

  .constitution-shell :global(li) {
    margin-bottom: 0.3rem;
  }

  .constitution-shell :global(li::marker) {
    color: var(--mf-ion);
  }

  .constitution-shell :global(strong) {
    color: var(--mf-text);
  }

  .constitution-shell :global(hr) {
    border: none;
    border-top: 1px solid var(--mf-line);
    margin: 2rem 0;
  }

  /* panels */
  .constitution-hero,
  .content-card {
    border: 1px solid var(--mf-line);
    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
  }

  .constitution-hero {
    padding: 1.4rem 1.4rem 1.3rem;
    margin-bottom: 1.2rem;
    border-top: 2px solid var(--mf-ion);
    background:
      linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
      linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
      radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
      var(--mf-bg);
  }

  .constitution-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .content-card {
    padding: 1.35rem 1.3rem 1.4rem;
    background:
      radial-gradient(ellipse at 0% 0%, color-mix(in srgb, var(--mf-ion) 7%, transparent), transparent 55%),
      var(--mf-panel);
  }

  .eyebrow {
    display: block;
    text-align: center;
    font-size: 0.75rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--mf-ion);
    margin-bottom: 0.7rem;
    font-weight: 700;
  }

  .hero-title {
    margin: 0;
    text-align: center;
    font-size: clamp(1.9rem, 4vw, 2.6rem);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: 0.02em;
    text-shadow: 0 0 18px var(--mf-line-strong);
  }

  .hero-subtitle {
    margin: 0.8rem auto 0;
    max-width: 760px;
    text-align: center;
    color: var(--mf-dim) !important;
    font-size: 0.95rem;
    line-height: 1.55;
  }

  /* table of contents */
  .toc-card {
    margin-top: 1.1rem;
    padding: 1rem 1rem 0.3rem;
    border: 1px solid var(--mf-line);
    background: var(--mf-panel);
  }

  .toc-title {
    margin: 0 0 0.85rem;
    text-align: center;
    font-size: 0.85rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--mf-ion) !important;
  }

  .toc-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem 1rem;
    align-items: start;
  }

  .toc-group {
    padding: 0.2rem 0 0.5rem 0.7rem;
    border-left: 2px solid var(--mf-line-strong);
  }

  .toc-group h3,
  .toc-group h4,
  .toc-group h5 {
    margin: 0;
    line-height: 1.2;
  }

  .toc-group h3 {
    font-size: 0.95rem;
    margin-bottom: 0.4rem;
  }

  .toc-group h4,
  .toc-group h5 {
    font-size: 0.84rem;
    font-weight: 500;
    color: var(--mf-dim) !important;
    margin-bottom: 0.3rem;
  }

  /* headings */
  .sectionHeading {
    margin: 0 0 1rem;
    padding-bottom: 0.65rem;
    border-bottom: 1px solid var(--mf-line-strong);
    font-size: clamp(1.4rem, 3vw, 1.85rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.02em;
    text-shadow: 0 0 18px var(--mf-line-strong);
  }

  .subSectionHeading {
    margin: 1.5rem 0 0.8rem;
    padding-left: 0.6rem;
    border-left: 3px solid var(--mf-ion);
    font-size: 1.14rem;
    line-height: 1.24;
  }

  h4 {
    margin-top: 1rem;
    margin-bottom: 0.45rem;
    font-size: 1rem;
    line-height: 1.24;
  }

  h5 {
    font-size: 0.92rem;
    margin-top: 0.85rem;
    margin-bottom: 0.3rem;
    line-height: 1.2;
  }

  .subBlock {
    margin: 0.45rem 0 1rem;
    padding: 0.85rem 0.95rem;
    border-left: 3px solid color-mix(in srgb, var(--mf-ion) 45%, transparent);
    background: var(--mf-panel-2);
  }

  .subBlock p:last-child,
  .subBlock ul:last-child {
    margin-bottom: 0;
  }

  .info-callout {
    margin: 0.75rem 0 1rem;
    padding: 0.8rem 0.95rem;
    border: 1px solid color-mix(in srgb, var(--mf-ion) 30%, transparent);
    background: color-mix(in srgb, var(--mf-ion) 7%, transparent);
    color: var(--mf-text);
  }

  .underscore {
    text-decoration: underline;
    text-decoration-color: var(--mf-ion);
    text-underline-offset: 3px;
  }

  .right {
    text-align: right;
  }

  .positionMaximums td {
    min-width: 3em;
  }

  .noUnderscore {
    text-decoration: none;
  }

  .clickable {
    cursor: pointer;
    transition: color 0.15s ease, transform 0.15s ease;
  }

  .clickable:hover {
    color: var(--mf-ion) !important;
    transform: translateX(2px);
  }

  /* tables */
  .draft-order-table,
  .positionMaximums,
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    background: var(--mf-panel);
    border: 1px solid var(--mf-line);
  }

  .draft-order-table {
    width: min(760px, 100%);
    margin: 0.75rem 0 1.15rem;
  }

  .draft-order-table th,
  .draft-order-table td,
  table th,
  table td {
    padding: 11px 14px;
    border: 1px solid var(--mf-line);
    vertical-align: top;
    color: var(--mf-text);
  }

  .table-header,
  table thead tr {
    background: linear-gradient(90deg, color-mix(in srgb, var(--mf-ion) 16%, transparent), transparent 70%), var(--mf-panel-2);
  }

  .table-header th,
  table thead th {
    color: var(--mf-ion);
    font-size: 0.8em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-top: 2px solid var(--mf-ion);
  }

  .total-row td {
    font-weight: 700;
    color: var(--mf-ion);
  }

  /* playoff bracket */
  .bracket-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 22px;
    margin: 1.3rem auto 1.15rem;
    padding: 1.1rem 1rem;
    overflow-x: auto;
    background:
      linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 24px,
      linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 24px 100%,
      var(--mf-bg);
    border: 1px solid var(--mf-line);
  }

  .round {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    min-width: 130px;
    position: relative;
  }

  .round-title {
    font-size: 0.8rem;
    color: var(--mf-ion);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 0.25rem;
  }

  .round-title small {
    color: var(--mf-dim);
    letter-spacing: 0.04em;
    text-transform: none;
  }

  .matchup {
    position: relative;
    background: var(--mf-panel);
    border: 1px solid var(--mf-line);
    border-left: 3px solid var(--mf-line-strong);
    padding: 10px;
    width: 120px;
    min-height: 58px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .team,
  .tbd,
  .championship {
    font-weight: 700;
    font-size: 0.74rem;
    line-height: 1.2;
  }

  .team {
    color: var(--mf-text);
  }

  .tbd {
    color: var(--mf-dim);
  }

  .championship {
    color: #e5b52a;
  }

  .round:nth-child(2) {
    gap: 72px;
  }

  .round:nth-child(3) {
    justify-content: center;
  }

  .round:nth-child(3) .matchup {
    border-left-color: #e5b52a;
  }

  .round:nth-child(1) .matchup::after,
  .round:nth-child(2) .matchup::after {
    content: '';
    position: absolute;
    right: -12px;
    top: 50%;
    width: 12px;
    border-top: 1px solid var(--mf-ion);
  }

  .round:nth-child(2) .matchup::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    width: 12px;
    border-top: 1px solid var(--mf-ion);
  }

  /* bookkeeping ledger */
  .ledger-wrap {
    width: 100%;
    margin: 1rem 0 1.3rem;
    overflow-x: auto;
  }

  .ledger-table {
    width: 100%;
    min-width: 620px;
    border-collapse: collapse;
    table-layout: fixed;
    background: var(--mf-panel);
    color: var(--mf-text);
    border: 1px solid var(--mf-line);
  }

  .ledger-table th,
  .ledger-table td {
    border: 1px solid var(--mf-line);
    padding: 0.5rem 0.55rem;
    font-size: 0.92rem;
    line-height: 1.2;
    color: var(--mf-text);
    font-variant-numeric: tabular-nums;
  }

  .ledger-title-row th {
    background: var(--mf-panel-2);
    border-top: 2px solid var(--mf-ion);
    color: var(--mf-text);
    font-size: 1.02rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
    padding: 0.65rem 0.45rem;
  }

  .ledger-section-row th {
    background: color-mix(in srgb, var(--mf-ion) 14%, var(--mf-panel));
    color: var(--mf-ion);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: left;
    padding: 0.4rem 0.55rem;
  }

  .ledger-section-row th:nth-child(2),
  .ledger-section-row th:nth-child(3) {
    text-align: center;
  }

  .ledger-highlight-row td {
    background: color-mix(in srgb, var(--mf-ion) 18%, var(--mf-panel));
    color: var(--mf-text);
    font-weight: 700;
  }

  .ledger-highlight-row .ledger-value {
    color: var(--mf-ion);
  }

  .ledger-table td:first-child,
  .ledger-table th:first-child {
    width: 62%;
  }

  .ledger-currency {
    width: 8%;
    text-align: center;
    white-space: nowrap;
  }

  .ledger-value {
    width: 30%;
    text-align: right;
    white-space: nowrap;
  }

  /* divisions */
  .division-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem 1rem;
    margin: 0.6rem 0 1rem;
    align-items: stretch;
  }

  .division-card {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 132px;
    padding: 0.9rem;
    background: var(--mf-panel-2);
    border: 1px solid var(--mf-line);
    border-top: 2px solid var(--mf-ion);
  }

  .division-card h4 {
    margin: 0 0 0.45rem;
    font-size: 0.95rem;
    line-height: 1.15;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .division-card .subBlock {
    margin: 0;
    padding: 0.55rem 0.7rem;
    border-left: 2px solid var(--mf-line-strong);
    background: transparent;
  }

  .division-card .subBlock p {
    margin: 0.22rem 0;
    line-height: 1.3;
    font-size: 0.84rem;
  }

  /* graphics */
  .lottery-graphic {
    display: block;
    margin: 1rem 0 1.4rem;
    border: 1px solid var(--mf-line-strong);
    box-shadow: 0 0 18px var(--mf-line);
  }

  .lottery-graphic img {
    display: block;
    width: 100%;
    height: auto;
  }

  @media (max-width: 700px) {
    .constitution-shell {
      width: calc(100% - 16px);
      margin: 1rem auto 3.5rem;
    }

    .constitution-hero {
      padding: 1rem 0.85rem;
      margin-bottom: 0.9rem;
    }

    .constitution-body {
      gap: 0.85rem;
    }

    .content-card {
      padding: 1rem 0.85rem 1.05rem;
    }

    .eyebrow {
      margin-bottom: 0.55rem;
      font-size: 0.68rem;
    }

    .hero-title {
      font-size: 1.5rem;
      line-height: 1.15;
    }

    .hero-subtitle {
      margin-top: 0.7rem;
      font-size: 0.86rem;
    }

    .toc-card {
      padding: 0.85rem 0.75rem 0.2rem;
    }

    .toc-grid {
      grid-template-columns: 1fr;
      gap: 0.7rem;
    }

    .toc-group h3 {
      font-size: 0.92rem;
    }

    .toc-group h4,
    .toc-group h5 {
      font-size: 0.8rem;
      line-height: 1.25;
    }

    .sectionHeading {
      font-size: 1.2rem;
      margin-bottom: 0.8rem;
      padding-bottom: 0.5rem;
    }

    .subSectionHeading {
      font-size: 1rem;
      margin-top: 1.1rem;
      margin-bottom: 0.6rem;
      line-height: 1.28;
    }

    h4 {
      font-size: 0.92rem;
      margin-top: 0.95rem;
      margin-bottom: 0.38rem;
    }

    h5 {
      font-size: 0.82rem;
    }

    .constitution-shell :global(p),
    .constitution-shell :global(li) {
      font-size: 0.9rem;
      line-height: 1.55;
    }

    .constitution-shell :global(p) {
      margin: 0.5rem 0 0.8rem;
    }

    .constitution-shell :global(ul),
    .constitution-shell :global(ol) {
      margin: 0.45rem 0 0.85rem;
      padding-left: 1.05rem;
    }

    .subBlock {
      margin: 0.45rem 0 0.9rem;
      padding: 0.75rem 0.8rem;
    }

    .draft-order-table,
    .positionMaximums,
    table {
      min-width: 0;
    }

    .draft-order-table th,
    .draft-order-table td,
    table th,
    table td {
      padding: 9px 10px;
      font-size: 0.8rem;
      line-height: 1.2;
    }

    .compact-mobile-table th,
    .compact-mobile-table td {
      padding: 8px 9px;
      font-size: 0.78rem;
      line-height: 1.15;
    }

    .bracket-container {
      justify-content: flex-start;
      padding: 0.9rem 0.75rem;
      gap: 16px;
    }

    .round {
      min-width: 112px;
    }

    .matchup {
      width: 104px;
      min-height: 52px;
      padding: 8px;
    }

    .round:nth-child(2) {
      gap: 52px;
    }

    .team,
    .tbd,
    .championship {
      font-size: 0.7rem;
    }

    .ledger-table {
      min-width: 560px;
    }

    .ledger-table th,
    .ledger-table td {
      padding: 0.4rem 0.36rem;
      font-size: 0.78rem;
      line-height: 1.15;
    }

    .ledger-title-row th {
      font-size: 0.9rem;
      padding: 0.5rem 0.3rem;
    }

    .division-grid {
      grid-template-columns: 1fr;
      gap: 0.7rem;
      margin: 0.45rem 0 0.9rem;
    }

    .division-card {
      min-height: auto;
      padding: 0.8rem;
    }

    .division-card .subBlock p {
      font-size: 0.8rem;
      line-height: 1.25;
      margin: 0.16rem 0;
    }
  }
</style>

<div class="constitution-shell">
  <div class="constitution-hero">
    <div class="eyebrow">Official League Document</div>
    <h1 class="hero-title noUnderscore">MANOR FANTASY FOOTBALL LEAGUE CONSTITUTION</h1>
    <p class="hero-subtitle">
      Rules, structure, league finances, playoffs, drafting procedures, and manager expectations for the MFFL.
    </p>

    <div class="toc-card">
      <h2 class="toc-title noUnderscore">Table of Contents</h2>

      <div class="toc-grid">
        <div class="toc-group">
          <h3 class="noUnderscore clickable" on:click={() => goToSection(one)}>Section 1: Roster</h3>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(oneOne)}>1.1 Positional Breakdown</h4>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneOneOne)}>1.1.1 Position Maximums</h5>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(oneTwo)}>1.2 Divisions</h4>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoOne)}>1.2.1 Divisional Structure</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoTwo)}>1.2.2 Divisions Reshuffle</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoThree)}>1.2.3 Division Selection Rights</h5>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(oneThree)}>1.3 Trading</h4>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeOne)}>1.3.1 Conditional Trades</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeTwo)}>1.3.2 Trade Collusion</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeThree)}>1.3.3 Lending Players Prohibition</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeFour)}>1.3.4 Trade Deadline</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeFive)}>1.3.5 Trade Restrictions</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeSix)}>1.3.6 Veto/Trade Process</h5>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(oneFour)}>1.4 Waiver Wire</h4>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneFourOne)}>1.4.1 Waiver Wire/FAAB Collusion</h5>
        </div>

        <div class="toc-group">
          <h3 class="noUnderscore clickable" on:click={() => goToSection(two)}>Section 2: Postseason</h3>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(twoOne)}>2.1 Playoffs</h4>

          <h3 class="noUnderscore clickable" on:click={() => goToSection(three)}>Section 3: Drafting</h3>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(threeOne)}>3.1 Drafts</h4>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(threeTwo)}>3.2 Draft Order</h4>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(threeThree)}>3.3 Draft Day Trades</h4>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(threeFour)}>3.4 Draft Order Determination</h4>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(threeFive)}>3.5 Draft Lottery FAAB Entry</h4>

          <h3 class="noUnderscore clickable" on:click={() => goToSection(four)}>Section 4: Scoring System</h3>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(fourOne)}>4.1 Scoring System</h4>

          <h3 class="noUnderscore clickable" on:click={() => goToSection(five)}>Section 5: Tanking Policy</h3>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(fiveOne)}>5.1 League Tanking Policy</h4>

          <h3 class="noUnderscore clickable" on:click={() => goToSection(six)}>Section 6: Replacing Managers</h3>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(sixOne)}>6.1 Removing Managers</h4>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(sixTwo)}>6.2 Replacing Managers</h4>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(sixThree)}>6.3 Quitting/Replacement of Inactive Managers</h4>

          <h3 class="noUnderscore clickable" on:click={() => goToSection(seven)}>Section 7: League Finances</h3>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(sevenOne)}>7.1 League Dues</h4>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(sevenTwo)}>7.2 Payout</h4>
          <h4 class="noUnderscore clickable" on:click={() => goToSection(sevenThree)}>7.3 Raising Dues</h4>
        </div>
      </div>
    </div>
  </div>

  <div class="constitution-body">
    <section class="content-card">
      <h2 class="sectionHeading" bind:this={one}>Section 1 Roster Breakdown</h2>

      <h3 class="subSectionHeading" bind:this={oneOne}>1.1 Positional Breakdown</h3>
      <p>26 Total Players</p>

      <a class="lottery-graphic" href="/roster-template.webp" target="_blank" rel="noopener">
        <img src="/roster-template.webp" alt="Blank MFFL roster: 9 starters (QB, 2 RB, 2 WR, TE, 2 FLEX, Superflex), 10 bench, 3 IR and 4 taxi squad spots" loading="lazy" width="980" height="905" />
      </a>
      <p class="underscore">Starters</p>
      <ul>
        <li>QB</li>
        <li>RB</li>
        <li>RB</li>
        <li>WR</li>
        <li>WR</li>
        <li>TE</li>
        <li>FLEX (RB/WR/TE)</li>
        <li>FLEX (RB/WR/TE)</li>
        <li>SUPERFLEX (QB/RB/WR/TE)</li>
      </ul>
      <p>10 Bench (expanded by 5 between the Competition Committee and draft day during the offseason).</p>
      <p>3 IR Spots (player must be labeled as IR, Out, or COVID in the Sleeper app).</p>
      <p>4 Taxi Squad (you may keep 2nd-year players in the taxi squad, but only true rookies will be able to move in and out).</p>

      <h4 bind:this={oneOneOne}>1.1.1 Position Maximums</h4>
      <div class="subBlock">
        <div class="ledger-wrap">
          <table class="positionMaximums">
            <tbody>
              <tr><td>QB - none</td></tr>
              <tr><td>RB - none</td></tr>
              <tr><td>WR - none</td></tr>
              <tr><td>TE - none</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3 class="subSectionHeading" bind:this={oneTwo}>1.2 Divisions</h3>
      <h4 bind:this={oneTwoOne}>1.2.1 Divisional Structure</h4>

      <div class="division-grid">
        <div class="division-card">
          <h4>North Division</h4>
          <div class="subBlock">
            <p>Team 1</p>
            <p>Team 2</p>
            <p>Team 3</p>
            <p>Team 4</p>
          </div>
        </div>

        <div class="division-card">
          <h4>South Division</h4>
          <div class="subBlock">
            <p>Team 5</p>
            <p>Team 6</p>
            <p>Team 7</p>
            <p>Team 8</p>
          </div>
        </div>

        <div class="division-card">
          <h4>East Division</h4>
          <div class="subBlock">
            <p>Team 9</p>
            <p>Team 10</p>
            <p>Team 11</p>
            <p>Team 12</p>
          </div>
        </div>

        <div class="division-card">
          <h4>West Division</h4>
          <div class="subBlock">
            <p>Team 13</p>
            <p>Team 14</p>
            <p>Team 15</p>
            <p>Team 16</p>
          </div>
        </div>
      </div>

      <h4 bind:this={oneTwoTwo}>1.2.2 Divisions Reshuffle</h4>
      <div class="subBlock">
        <p>
          The league will reshuffle divisions every four years to keep competition fresh and balanced. The next reshuffle is
          scheduled for the 2027–2028 offseason or the start of the 2028 season.
        </p>
      </div>

      <h4 bind:this={oneTwoThree}>1.2.3 Division Selection Rights</h4>
      <div class="subBlock">
        <p>
          At the time divisions are reshuffled, teams may use FAAB to purchase the right to select their division placement, by way of an auction.
        </p>
        <ul>
          <li>Only one team may purchase this right per reshuffle cycle.</li>
          <li>Three teams will be assigned to each division, leaving four spots open, one per division, allowing the winning team to choose its division before the remaining teams are assigned.</li>
          <li>The purchase window, and tiebreak procedure will be a spin-off using the online tool.</li>
          <li>If no team purchases the right, divisions will be assigned according to the league’s standard reshuffle process.</li>
        </ul>
      </div>

      <h3 class="subSectionHeading" bind:this={oneThree}>1.3 Trading</h3>
      <p>
        Tradable assets include players, draft picks, and FAAB dollars. Conditional trades are also permitted.
      </p>

      <h4 bind:this={oneThreeOne}>1.3.1 Conditional Trades</h4>
      <div class="subBlock">
        <h5>What a Conditional Trade Is</h5>
        <p>
          A conditional trade is a deal where part of the compensation, typically a draft pick or FAAB, depends on future
          objective outcomes involving a player.
        </p>

        <h5>Make Up of Trade</h5>
        <ul>
          <li>A conditional trade must involve exactly one player as the primary asset.</li>
          <li>No multi-player packages are permitted within a condition.</li>
          <li>The conditional component may only apply to draft picks or FAAB tied to that single player.</li>
        </ul>

        <h5>What Assets Are Allowed</h5>
        <p><strong>Allowed:</strong></p>
        <ul>
          <li>Draft picks</li>
          <li>FAAB</li>
        </ul>
        <p><strong>Not Allowed:</strong></p>
        <ul>
          <li>Players may not be used as conditional assets.</li>
          <li>Players may not be added, removed, or substituted based on conditions.</li>
          <li>Players may not be the upgraded or downgraded commodity in a conditional trade.</li>
        </ul>

        <h5>What Conditions Are Allowed</h5>
        <p>Conditions must be:</p>
        <ul>
          <li>
            Objective — The condition must be based on clear, factual criteria that can be verified without opinion, judgment, or
            interpretation.
          </li>
          <li>Statistically measurable.</li>
          <li>Clearly defined at the time of the trade.</li>
          <li>Met at the end of that season.</li>
        </ul>
        <p>Examples:</p>
        <ul>
          <li>Draft pick upgrades if a player plays X% of games, scores X number of TDs, or reaches X number of yards.</li>
          <li>Pick improves if the player wins the starting position for the remainder of the year.</li>
          <li>Pick adjusts if the player is on the roster by a specific date.</li>
        </ul>

        <h5>What Is NOT Allowed</h5>
        <p>Conditions may not be:</p>
        <ul>
          <li>Subjective, such as “plays well”.</li>
          <li>Based on vague voting or opinion, such as “Pro Bowl”.</li>
          <li>Dependent on renegotiations or future contract changes.</li>
          <li>Open-ended or undefined.</li>
        </ul>
        <p>The league must be able to verify the condition without interpretation.</p>

        <h5>Draft Pick Structure Rules</h5>
        <ul>
          <li>Conditional picks must be from the same draft year. This means all conditional picks will be locked from future trading.</li>
          <li>Picks may escalate or downgrade, for example 6th → 4th.</li>
          <li>Only one final outcome per condition set is allowed.</li>
          <li>The final pick is determined after the season concludes and will be closed at the next Competition Committee meeting.</li>
        </ul>

        <h5>Timing &amp; Filing</h5>
        <ul>
          <li>All conditions must be submitted at trade approval.</li>
          <li>Conditions cannot be altered once approved.</li>
          <li>Once resolved, outcomes will be reviewed and processed following the Competition Committee.</li>
        </ul>
        <p><strong>Note to Commissioners:</strong></p>
        <p>
          All conditional terms must be documented and submitted at the time of trade approval. Any condition not explicitly filed
          at approval is considered invalid.
        </p>

        <h5>Common Real-World Examples</h5>
        <ul>
          <li>“2025 4th becomes a 2nd if player plays 60% of games.”</li>
          <li>“2026 3rd becomes a 1st if player plays 50%.”</li>
          <li>“$100 FAAB is incremented if a player reaches 4,500 passing yards for the season.”</li>
        </ul>

        <h5>Why Teams Use Conditional Trades</h5>
        <ul>
          <li>Reduces risk on injury-prone or aging players.</li>
          <li>Protects against short-term rentals.</li>
          <li>Encourages fair value tied to actual contribution.</li>
        </ul>

        <h5>Bottom Line</h5>
        <p>If the condition is clear, measurable, and filed upfront, it is legal.</p>
        <p>If it requires interpretation or future negotiation, it is not.</p>
        <p>All conditional trades require approval from all three commissioners.</p>
      </div>

      <h4 bind:this={oneThreeTwo}>1.3.2 Trade Collusion</h4>
      <div class="subBlock">
        <p>
          If any managers are suspected of offering or accepting bribes to enhance their own team or another manager’s team via
          trade, trading assets other than fantasy players, draft picks, or FAAB dollars, or are otherwise found guilty of any
          form of collusion, all parties involved in the trade will be subject to disciplinary action. Punishments may include
          the following:
        </p>
        <ul>
          <li>First offense – Immediate reduction of FAAB budget by 80%</li>
          <li>
            Second offense – An immediate freeze on all transaction types, including trades and waiver wire bids, for the next 17
            weeks of regular season and playoff fantasy football games. This equates to a one-year suspension from all trades and
            waiver wire activity.
          </li>
          <li>
            Third offense – A league meeting of all members not involved in any of the improper trades or activity in question
            will take place to discuss next steps.
          </li>
        </ul>
        <p>
          All trades that are found guilty of collusion will be reversed or denied. If the trade affected the outcome of previous
          games, the results of those games will be revised.
        </p>
      </div>

      <h4 bind:this={oneThreeThree}>1.3.3 Lending Players Prohibition</h4>
      <div class="subBlock">
        <p>
          For trades involving any player ranked in the top 50 in Sleeper's rankings, reacquisition by the original team is prohibited for two years
          after the trade, with no offseason exception. These players will be tagged with “NO TRADE BACK TO/FROM” to enforce this
          rule.
        </p>
      </div>

      <h4 bind:this={oneThreeFour}>1.3.4 Trade Deadline</h4>
      <div class="subBlock">
        <p>The trade deadline will be set for Wednesday of Week 7 at 8:00 p.m. Central Time.</p>
      </div>

      <h4 bind:this={oneThreeFive}>1.3.5 Trade Restrictions</h4>
      <div class="subBlock">
        <p>
          You may not trade draft picks that are more than three drafts away. For example, during the 2021 season you cannot
          trade any picks in or after the 2025 draft.
        </p>
      </div>

      <h4 bind:this={oneThreeSix}>1.3.6 Veto/Trade Process</h4>
      <div class="subBlock">
        <p>Only the Commissioner may veto trades. See Section 1.3 Trading.</p>
      </div>

      <h3 class="subSectionHeading" bind:this={oneFour}>1.4 Waiver Wire</h3>
      <p>
        Beginning in the 2023 season, MFFL will award bonus FAAB (Free Agent Acquisition Budget) dollars to managers who attend
        and actively participate in the league’s Competition Committee meetings and the in-person draft. Out-of-town managers
        must follow along and participate live during the draft to qualify. Auto-drafting is not allowed.
      </p>

      <p>
        FAAB Waiver Wire System: Each team will begin the season with a Free Agent Acquisition Budget (FAAB) between $100 and
        $200, with the exact amount announced by the Commissioner before the season starts. No $0 bids are allowed. Waiver bids
        will process every Thursday at 2:00 a.m.
      </p>

      <p>FAAB budgets carry over to the next season, up to a maximum of $999.</p>

      <h4 bind:this={oneFourOne}>1.4.1 Waiver Wire/FAAB Collusion</h4>
      <div class="subBlock">
        <p>
          Collusion includes any coordinated efforts to manipulate the waiver wire or FAAB system for an unfair advantage. This
          includes, but is not limited to:
        </p>
        <ul>
          <li>Pooling FAAB budgets between teams.</li>
          <li>
            Dropping a player with the intent of allowing a specific team to acquire them, particularly if it is known that the
            team with the highest FAAB will likely pick up the player.
          </li>
        </ul>
        <p>
          The Commissioner reserves the right to investigate any suspicious bidding or dropping patterns and to take disciplinary
          action if collusion is suspected. Punishments for FAAB or waiver wire collusion may include FAAB penalties,
          transaction freezes, or other sanctions as outlined in the league’s collusion policy.
        </p>
      </div>
    </section>

    <section class="content-card">
      <h2 class="sectionHeading" bind:this={two}>Section 2 Postseason</h2>

      <h3 class="subSectionHeading" bind:this={twoOne}>2.1 Playoffs</h3>
      <p>
        At the end of the season, 8 teams will make the playoffs. The Quarterfinals will begin in Week 15. Each
        team that wins its division, North, South, East, and West (4), and the 4 wild card teams that finish with the best
        records overall from the remaining teams, will receive a playoff berth. Each playoff matchup will last one week, and
        the winner will advance. Week 18 will not be used.
      </p>
      <p>Division winners are seeded 1–4 by record, and the four wild cards are seeded 5–8 by record.</p>
      <p>The seed determination is as follows:</p>
      <p>1. Overall record.</p>
      <p>2. Points For.</p>
      <p>3. Points Against.</p>
      <p>4. Coin flip (in extreme cases).</p>
      <p>
        The first-round matchups will be determined by end-of-season seeding: 1-vs-8, 2-vs-7, 3-vs-6, and 4-vs-5. In the
        following rounds, each team stays on its side of the bracket as they advance.
      </p>

      <div class="bracket-container">
        <div class="round">
          <div class="round-title">Quarterfinals <br /><small>(Week 15)</small></div>

          <div class="matchup">
            <div class="team">#1 TEAM</div>
            <div class="team">#8 TEAM</div>
          </div>

          <div class="matchup">
            <div class="team">#4 TEAM</div>
            <div class="team">#5 TEAM</div>
          </div>

          <div class="matchup">
            <div class="team">#3 TEAM</div>
            <div class="team">#6 TEAM</div>
          </div>

          <div class="matchup">
            <div class="team">#2 TEAM</div>
            <div class="team">#7 TEAM</div>
          </div>
        </div>

        <div class="round">
          <div class="round-title">Semifinals <br /><small>(Week 16)</small></div>

          <div class="matchup">
            <div class="tbd">#1/#8</div>
            <div class="tbd">#4/#5</div>
          </div>

          <div class="matchup">
            <div class="tbd">#3/#6</div>
            <div class="tbd">#2/#7</div>
          </div>
        </div>

        <div class="round">
          <div class="round-title">Championship <br /><small>(Week 17)</small></div>

          <div class="matchup">
            <div class="championship">Champ</div>
            <div class="tbd">TBD</div>
            <div class="tbd">TBD</div>
          </div>
        </div>
      </div>

      <div class="info-callout">
        A similar bracket for the remaining 8 teams, called the "Toilet Bowl," will be formed following the same logic.
      </div>
    </section>

    <section class="content-card">
      <h2 class="sectionHeading" bind:this={three}>Section 3 Drafting</h2>

      <h3 class="subSectionHeading" bind:this={threeOne}>3.1 Drafts</h3>
      <p>
        The draft will consist of rookies only and will take place over 5 rounds, with a 5-minute limit per pick. To accommodate
        incoming players, bench sizes will temporarily expand by five spots at the start of the season, following the Competition
        Committee meeting. These additional spots will be removed shortly after the draft, at which point all teams must reduce
        their rosters to comply with standard roster limits.
      </p>
      <p>Any spots not filled during the draft can be filled immediately afterward from the waiver wire.</p>

      <h3 class="subSectionHeading" bind:this={threeTwo}>3.2 Draft Order</h3>
      <p>The draft order each year will be linear.</p>

      <div class="subBlock">
        <div class="ledger-wrap">
          <table class="draft-order-table">
            <thead>
              <tr class="table-header">
                <th>Round</th>
                <th>Picks</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Round #1</td><td>1–16</td></tr>
              <tr><td>Round #2</td><td>1–16</td></tr>
              <tr><td>Round #3</td><td>1–16</td></tr>
              <tr><td>Round #4</td><td>1–16</td></tr>
              <tr><td>Round #5</td><td>1–16</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <p>
        If you trade future draft picks, you are required to actively manage your team through the playoffs in those seasons. If
        you fail to do so, the commissioners reserve the right to set your lineup to the best possible lineup each week in order
        to maintain the integrity of those draft picks.
      </p>

      <h3 class="subSectionHeading" bind:this={threeThree}>3.3 Draft Day Trades</h3>
      <p>
        If a trade is being negotiated during the draft, either party may request that the Commissioner pause the draft to allow
        additional time for trade discussions.
      </p>

      <h3 class="subSectionHeading" id="draft-order" bind:this={threeFour}>3.4 Draft Order Determination</h3>
      <p>
        To discourage tanking and keep every team competing through Week 17, the draft order is set at a lottery drawing held
        after the season. The order is drawn from pick #16 down to pick #1.
      </p>

      <a class="lottery-graphic" href="/lottery-night.webp" target="_blank" rel="noopener">
        <img src="/lottery-night.webp" alt="MFFL Draft Lottery Night: how the draft order is drawn, from pick 16 down to pick 1" loading="lazy" width="1400" height="1372" />
      </a>

      <p>A team keeps every ball it earns, so one team can earn balls from both the regular season and the Toilet Bowl.</p>

      <h4>The 8th seed</h4>
      <p>
        The 8th seed is placed in the lottery pool no matter how far it advances in the playoffs. It is the only playoff team
        eligible for the #1 pick. When the 8th seed finishes in the top seven of the playoffs, the playoff teams below it each
        move up one place for the drawings below.
      </p>

      <h4>The drawing, in order</h4>
      <div class="subBlock">
        <ol>
          <li><strong>Picks #16 and #15:</strong> the top two playoff finishers (excluding the 8th seed) each receive one ball. The first team drawn picks #16.</li>
          <li><strong>Picks #14 through #10:</strong> the next five playoff finishers (excluding the 8th seed) each receive one ball, drawn for #14 down to #10.</li>
          <li>
            <strong>Lottery pool (picks #9 through #1):</strong> the 8th seed and the eight non-playoff teams.
            <ul>
              <li>Teams in the pool <strong>without</strong> balls each receive one ball and are drawn first, for the lowest open picks starting at #9. If only one team has no balls, it receives #9 automatically.</li>
              <li>Teams <strong>with</strong> balls are drawn last, using their earned balls, starting with pick #1. Once a team is drawn, all of its remaining balls are removed. The FAAB auction ball counts only for the #1 pick, then is removed.</li>
            </ul>
          </li>
        </ol>
      </div>
      <div class="info-callout">
        Between 4 and 8 teams will hold balls in any season, so the earned-ball drawing decides the top 4 to 8 picks.
      </div>

      <h3 class="subSectionHeading" bind:this={threeFive}>3.5 Draft Lottery FAAB Entry</h3>
      <p>
        One additional ping-pong entry for the #1 overall pick will be auctioned each year for FAAB.
      </p>
      <div class="subBlock">
        <ul>
          <li>Only non-playoff teams may bid.</li>
          <li>Only one entry is awarded per year, to the highest bidder.</li>
          <li>Bids are submitted as sealed bids, using a method announced by the Commissioner, and are collected by a commissioner whose team is not bidding.</li>
          <li>The bidding window and minimum bid will be announced by the Commissioner before the lottery.</li>
          <li>Ties will be broken by a spin-off using the online tool.</li>
          <li>The winning bid is deducted from the winning team's FAAB budget. A team may not bid more FAAB than it has.</li>
          <li>If no team bids, no additional entry is awarded.</li>
        </ul>
      </div>
    </section>

    <section class="content-card">
      <h2 class="sectionHeading" bind:this={four}>Section 4 Scoring System</h2>

      <h3 class="subSectionHeading" bind:this={fourOne}>4.1 Scoring System</h3>
      <p>
        The official scoring system for the Manor Fantasy Football League (MFFL) is maintained within the Sleeper fantasy platform.
        All scoring values, stat categories, and rule interpretations are governed by the league settings in the Sleeper app.
      </p>
      <p>
        The scoring structure may not be changed during an active season. Any modifications to scoring rules must be approved
        by a majority league vote, requiring a minimum of 9 votes.
      </p>
    </section>

    <section class="content-card">
      <h2 class="sectionHeading" bind:this={five}>Section 5 Tanking Policy</h2>

      <h3 class="subSectionHeading" bind:this={fiveOne}>5.1 League Tanking Policy</h3>
      <p>
        Tanking may be a strategy that a manager employs to improve the team’s draft position. Please make sure to fully
        understand the potential consequences of tanking, which may include the following season’s strength of schedule. Leaving
        your lineup empty is not allowed, as this is considered "ghosting" your team. Ghosting will result in the manager being
        removed from the league. Please notify the Commissioner when tanking.
      </p>
    </section>

    <section class="content-card">
      <h2 class="sectionHeading" bind:this={six}>Section 6 Replacing Managers</h2>

      <h3 class="subSectionHeading" bind:this={sixOne}>6.1 Removing Managers</h3>
      <p>
        A manager can be removed against their will in cases of repeatedly failing to set a valid lineup, confirmed collusion, or
        lack of participation in the Competition Committee, in-person draft, league chat, trade offers, or waiver wire. Staying
        active throughout the season is strongly encouraged, as inactivity may be considered grounds for removal.
      </p>
      <p>Three Strikes and You're Out Rule:</p>
      <p>
        If a manager’s team finishes 14th, 15th, or 16th in the regular-season standings in back-to-back seasons, they must plead their strategy to the
        Commissioner and co-commissioners. If approved, they will get one final season, a probation year, where their team must
        improve as outlined by the commissioners. Failure to do so means strike three, and they are out.
      </p>

      <h3 class="subSectionHeading" bind:this={sixTwo}>6.2 Replacing Managers</h3>
      <p>
        When a manager is replaced, the commissioners will try to find a suitable candidate with some connection to at least a
        portion of the existing managers. A list of potential candidates is maintained by the Commissioner. If you know of
        someone interested in joining, please provide their name to the Commissioner. Priority will be given to managers who are
        eager to commit to a dynasty league and will be highly active within the league.
      </p>
      <p>
        When a new manager joins the league, the Commissioner has the authority to award the #1 draft pick to the incoming
        manager as compensation for taking over a non-competitive team. All three commissioners must vote and agree. In the event
        that one of the commissioners has a conflict of interest, meaning they might land the #1 pick, a substitute league
        manager will vote in that commissioner’s place.
      </p>

      <h3 class="subSectionHeading" bind:this={sixThree}>6.3 Quitting/Replacement of Inactive Managers</h3>
      <p>In the event that a manager chooses to quit the league, the following conditions must be met:</p>
      <p>1. A reigning champion cannot leave the league; they must return to defend or forfeit their championship.</p>
      <p>2. If future draft picks are traded, a manager cannot leave their team. If you plan on quitting, please keep this in mind.</p>
      <p>3. Once you leave the MFFL, you can never return. Keep in mind that if you quit or are removed from the league, you will not be invited back.</p>

      <p>A FAAB bonus may be added to new incoming managers for their initial season.</p>
    </section>

    <section class="content-card">
      <h2 class="sectionHeading" bind:this={seven}>Section 7 League Finances</h2>

      <h3 class="subSectionHeading" bind:this={sevenOne}>7.1 League Dues</h3>
      <div class="info-callout">
        League dues are set at ${dues} and are collected by the Commissioner. All managers must be fully paid by draft day of the season.
      </div>

      <h3 class="subSectionHeading" bind:this={sevenTwo}>7.2 Payout</h3>
      <p>League payout is structured as follows:</p>
      <p>Each Divisional Champion will receive a $25 payout.</p>
      <p>
        Commissioners will receive FAAB compensation equal to 25% of the maximum FAAB allowed for that season, split evenly among
        all active commissioners.
      </p>

      <div class="ledger-wrap">
        <table class="ledger-table">
          <tbody>
            <tr class="ledger-title-row">
              <th colspan="3">2026 League Bookkeeping</th>
            </tr>

            <tr class="ledger-section-row">
              <th>Description of Incoming Money</th>
              <th colspan="2">Amount</th>
            </tr>
            <tr>
              <td>Rolling From 2025</td>
              <td class="ledger-currency"></td>
              <td class="ledger-value">$    -</td>
            </tr>
            <tr>
              <td>Number of Owners</td>
              <td class="ledger-currency"></td>
              <td class="ledger-value">16</td>
            </tr>
            <tr>
              <td>Cost to Play (Fee)</td>
              <td class="ledger-currency"></td>
              <td class="ledger-value">$  100.00</td>
            </tr>
            <tr>
              <td>Total Collected 2026</td>
              <td class="ledger-currency"></td>
              <td class="ledger-value">$ 1,600.00</td>
            </tr>
            <tr>
              <td>2025 Rolling and 2026 Collect</td>
              <td class="ledger-currency"></td>
              <td class="ledger-value">$ 1,600.00</td>
            </tr>

            <tr class="ledger-section-row">
              <th>Description of Outgoing Money</th>
              <th>Amount</th>
              <th>Balance</th>
            </tr>
            <tr>
              <td>1st Place Payout</td>
              <td class="ledger-value">$ 1,000.00</td>
              <td class="ledger-value">$ 600.00</td>
            </tr>
            <tr>
              <td>2nd Place Payout</td>
              <td class="ledger-value">$ 75.00</td>
              <td class="ledger-value">$ 525.00</td>
            </tr>
            <tr>
              <td>Division Winners Payout (4x$25)</td>
              <td class="ledger-value">$ 100.00</td>
              <td class="ledger-value">$ 425.00</td>
            </tr>
            <tr>
              <td>Trophy Plaque</td>
              <td class="ledger-value">$ 5.00</td>
              <td class="ledger-value">$ 420.00</td>
            </tr>
            <tr>
              <td>Trophy Shipment (if needed)</td>
              <td class="ledger-value">$ 25.00</td>
              <td class="ledger-value">$ 395.00</td>
            </tr>
            <tr>
              <td>Current Champion Ring</td>
              <td class="ledger-value">$ 42.74</td>
              <td class="ledger-value">$ 352.26</td>
            </tr>
            <tr class="ledger-section-row">
              <th>Outstanding Items</th>
              <th></th>
              <th></th>
            </tr>
            <tr>
              <td>Rings</td>
              <td class="ledger-value">GC2017, TF2019, JR2020, MA2021</td>
              <td class="ledger-value">$ 155.00</td>
            </tr>
            <tr>
              <td>Trophy Base</td>
              <td></td>
              <td class="ledger-value">$ 150.00</td>
            </tr>
            <tr>
              <td>Total Outstanding</td>
              <td></td>
              <td class="ledger-value">$ 305.00</td>
            </tr>
            <tr class="ledger-highlight-row">
              <td>Rolling to 2027</td>
              <td></td>
              <td class="ledger-value">$ 47.26</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="subSectionHeading" bind:this={sevenThree}>7.3 Raising Dues</h3>
      <p>
        A ⅔ majority vote (11) is required in order to raise league dues. In the event that a manager is no longer financially
        comfortable with the buy-in, finding a co-manager to split the cost is recommended.
      </p>
    </section>
  </div>
</div>
