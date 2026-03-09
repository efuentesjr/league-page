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
  :global(body) {
    background:
      radial-gradient(circle at top, rgba(178, 140, 56, 0.08), transparent 24%),
      linear-gradient(180deg, #09111f 0%, #0c1524 38%, #101826 100%);
    color: #e5e7eb;
  }

  :global(h1, h2, h3, h4, h5) {
    color: #f8fafc;
  }

  :global(p),
  :global(li) {
    color: #cbd5e1;
    line-height: 1.75;
  }

  :global(ul) {
    padding-left: 1.4rem;
    margin: 0.65rem 0 1rem;
  }

  :global(ul li) {
    margin-bottom: 3px;
  }

  :global(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin: 2rem 0;
  }

  .constitution-shell {
    width: min(920px, 92%);
    margin: 4.25rem auto 7rem;
  }

  .constitution-hero {
    padding: 0 0 1.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  }

  .constitution-body {
    margin-top: 0;
    padding: 0;
  }

  .eyebrow {
    display: inline-block;
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #d4af37;
    margin-bottom: 0.85rem;
    font-weight: 700;
  }

  .hero-title {
    margin: 0;
    text-align: center;
    font-size: clamp(2rem, 4vw, 2.7rem);
    line-height: 1.08;
  }

  .hero-subtitle {
    margin: 1rem auto 0;
    max-width: 760px;
    text-align: center;
    color: #94a3b8;
    font-size: 0.96rem;
  }

  .toc-card {
    margin-top: 1.1rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .toc-title {
    margin: 0 0 0.85rem;
    text-align: center;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #d4af37;
  }

  .toc-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem 1.4rem;
    align-items: start;
  }

  .toc-group h3,
  .toc-group h4,
  .toc-group h5 {
    margin: 0;
    line-height: 1.2;
  }

  .toc-group h3 {
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
  }

  .toc-group h4,
  .toc-group h5 {
    font-size: 0.85rem;
    color: #9fb3c8;
    margin-bottom: 0.16rem;
  }

  .sectionHeading {
    margin: 3rem 0 1rem;
    padding-bottom: 0.7rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.24);
    font-size: clamp(1.45rem, 3vw, 1.9rem);
  }

  .subSectionHeading {
    margin: 1.5rem 0 0.85rem;
    font-size: 1.18rem;
  }

  h4 {
    margin-top: 1.15rem;
    margin-bottom: 0.55rem;
    font-size: 1rem;
  }

  h5 {
    font-size: 0.92rem;
    color: #cbd5e1;
  }

  .subBlock {
    margin-left: 1rem;
    padding-left: 0.9rem;
    border-left: 2px solid rgba(212, 175, 55, 0.16);
  }

  .underscore {
    text-decoration: underline;
    text-decoration-color: rgba(212, 175, 55, 0.7);
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
    transition: color 0.18s ease, transform 0.18s ease;
  }

  .clickable:hover {
    color: #f5d56b;
    transform: translateX(2px);
  }

  .draft-order-table,
  .scoring-table table,
  .positionMaximums,
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
  }

  .draft-order-table {
    width: min(760px, 100%);
    margin: 1rem 0 1.5rem;
  }

  .draft-order-table th,
  .draft-order-table td,
  .scoring-table td,
  table th,
  table td {
    padding: 12px 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .table-header,
  table thead tr {
    background: rgba(122, 28, 28, 0.75);
  }

  .table-header th,
  table thead th {
    color: #fff;
  }

  .total-row td {
    font-weight: 700;
    color: #f5d56b;
  }

  /* PLAYOFF BRACKET */

  .bracket-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 22px;
    margin: 1.75rem auto;
    padding: 1.25rem 1rem;
    overflow-x: auto;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
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
    font-size: 0.82rem;
    color: #d4af37;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.35rem;
  }

  .matchup {
    position: relative;
    background: linear-gradient(180deg, #1e293b, #0f172a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 10px;
    border-radius: 10px;
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
    color: #f8fafc;
  }

  .tbd {
    color: #94a3b8;
  }

  .championship {
    color: #f5d56b;
  }

  .round:nth-child(2) {
    gap: 72px;
  }

  .round:nth-child(3) {
    justify-content: center;
  }

  .round:nth-child(1) .matchup::after,
  .round:nth-child(2) .matchup::after {
    content: '';
    position: absolute;
    right: -12px;
    top: 50%;
    width: 12px;
    border-top: 1px solid rgba(212, 175, 55, 0.45);
  }

  .round:nth-child(2) .matchup::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    width: 12px;
    border-top: 1px solid rgba(212, 175, 55, 0.45);
  }

  /* 4.1 SCORING GRID */

  .scoring-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem 1rem;
    align-items: start;
    margin: 1rem 0 1.25rem;
  }

  .scoring-table {
    margin: 0;
  }

  .scoring-table table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .scoring-table td {
    padding: 6px 8px;
    font-size: 0.82rem;
    line-height: 1.2;
    vertical-align: middle;
  }

  .scoring-table td:first-child {
    width: 62%;
  }

  .scoring-table input {
    width: 46px;
    padding: 2px 4px;
    font-size: 0.78rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    background: rgba(2, 6, 23, 0.65);
    color: #f8fafc;
  }

  .description {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.15rem;
    line-height: 1.1;
  }

  /* 7.2 LEDGER */

  .ledger-wrap {
    width: 100%;
    margin: 1rem 0 1.5rem;
    overflow-x: auto;
  }

  .ledger-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    background: #f3f3f3;
    color: #111;
    border: 1px solid #222;
  }

  .ledger-table th,
  .ledger-table td {
    border: 1px solid #222;
    padding: 0.28rem 0.3rem;
    font-size: 0.94rem;
    line-height: 1.15;
    color: #111;
  }

  .ledger-title-row th {
    background: #9a9a9a;
    color: #000;
    font-size: 1.05rem;
    font-weight: 700;
    text-align: center;
    padding: 0.55rem 0.4rem;
  }

  .ledger-section-row th {
    background: #375da3;
    color: #fff;
    font-weight: 700;
    text-align: left;
    padding: 0.22rem 0.3rem;
  }

  .ledger-section-row th:nth-child(2),
  .ledger-section-row th:nth-child(3) {
    text-align: center;
  }

  .ledger-highlight-row td {
    background: #375da3;
    color: #fff;
    font-weight: 700;
  }

  .ledger-highlight-row .ledger-value {
    color: #fff;
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

  /* MOBILE */

  @media (max-width: 700px) {
    .toc-grid {
      grid-template-columns: 1fr;
      gap: 0.2rem;
    }

    .toc-title {
      margin-bottom: 0.7rem;
    }

    .toc-group h3,
    .toc-group h4,
    .toc-group h5 {
      margin: 0;
      line-height: 1.15;
    }

    .toc-group h3 {
      font-size: 0.92rem;
      margin-bottom: 0.14rem;
    }

    .toc-group h4,
    .toc-group h5 {
      font-size: 0.84rem;
      margin-bottom: 0.1rem;
    }

    .constitution-shell {
      width: min(96%, 96%);
      margin-top: 2rem;
    }

    .hero-title {
      font-size: 1.7rem;
    }

    .hero-subtitle {
      font-size: 0.9rem;
    }

    .sectionHeading {
      font-size: 1.25rem;
      margin-top: 1.75rem;
    }

    .subSectionHeading {
      font-size: 1rem;
    }

    h4 {
      font-size: 0.95rem;
    }

    h5 {
      font-size: 0.85rem;
    }

    .draft-order-table,
    table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
    }

    .compact-mobile-table th,
    .compact-mobile-table td {
      padding: 3px 5px;
      font-size: 0.68rem;
      line-height: 1.05;
    }

    .bracket-container {
      justify-content: flex-start;
      padding: 1rem 0.75rem;
      gap: 16px;
    }

    .round {
      min-width: 118px;
    }

    .matchup {
      width: 108px;
      min-height: 54px;
      padding: 8px;
    }

    .round:nth-child(2) {
      gap: 54px;
    }

    .scoring-grid {
      grid-template-columns: 1fr;
      gap: 0.7rem;
    }

    .compact-scoring-table td {
      padding: 4px 6px;
      font-size: 0.7rem;
      line-height: 1.1;
    }

    .compact-scoring-table input {
      width: 40px;
      font-size: 0.68rem;
      padding: 2px;
    }

    .compact-scoring-table .description {
      font-size: 0.62rem;
      line-height: 1.05;
    }

    .ledger-table th,
    .ledger-table td {
      padding: 0.2rem 0.22rem;
      font-size: 0.62rem;
      line-height: 1.05;
    }

    .ledger-title-row th {
      font-size: 0.8rem;
      padding: 0.35rem 0.2rem;
    }

    .ledger-currency {
      width: 10%;
    }

    .ledger-value {
      width: 28%;
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
    <h2 class="sectionHeading" bind:this={one}>Section 1 Roster Breakdown</h2>
    <h3 class="subSectionHeading" bind:this={oneOne}>1.1 Positional Breakdown</h3>
    <p>26 Total Players</p>
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
      <table class="positionMaximums">
        <tbody>
          <tr><td>QB</td><td class="right">none</td></tr>
          <tr><td>RB</td><td class="right">none</td></tr>
          <tr><td>WR</td><td class="right">none</td></tr>
          <tr><td>TE</td><td class="right">none</td></tr>
        </tbody>
      </table>
    </div>

    <h3 class="subSectionHeading" bind:this={oneTwo}>1.2 Divisions</h3>
    <h4 bind:this={oneTwoOne}>1.2.1 Divisional Structure</h4>

    <div>
      <h4>North Division:</h4>
      <div class="subBlock">
        <p>Team 1</p>
        <p>Team 2</p>
        <p>Team 3</p>
        <p>Team 4</p>
      </div>

      <h4>South Division:</h4>
      <div class="subBlock">
        <p>Team 5</p>
        <p>Team 6</p>
        <p>Team 7</p>
        <p>Team 8</p>
      </div>

      <h4>East Division:</h4>
      <div class="subBlock">
        <p>Team 9</p>
        <p>Team 10</p>
        <p>Team 11</p>
        <p>Team 12</p>
      </div>

      <h4>West Division:</h4>
      <div class="subBlock">
        <p>Team 13</p>
        <p>Team 14</p>
        <p>Team 15</p>
        <p>Team 16</p>
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
        At the time divisions are reshuffled, teams may use FAAB to purchase the right to select their division placement.
      </p>
      <ul>
        <li>Only one team may purchase this right per reshuffle cycle.</li>
        <li>The winning team will choose its division before the remaining teams are assigned.</li>
        <li>The FAAB amount, purchase window, and tiebreak procedure will be announced by the Commissioner before the reshuffle.</li>
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

      <h5>iming &amp; Filing</h5>
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
      <p>All conditional trades are subject to approval by a majority vote of the three commissioners.</p>
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
        For trades involving any player ranked in the top 50, reacquisition by the original team is prohibited for two years
        after the trade, with no offseason exception. These players will be tagged with “NO TRADE BACK TO/FROM” to enforce this
        rule.
      </p>
    </div>

    <h4 bind:this={oneThreeFour}>1.3.4 Trade Deadline</h4>
    <div class="subBlock">
      <p>The trade deadline will be set for Wednesday of Week 7 at 8:00 p.m. CST.</p>
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

    <h2 class="sectionHeading" bind:this={two}>Section 2 Postseason</h2>

    <h3 class="subSectionHeading" bind:this={twoOne}>2.1 Playoffs</h3>
    <p>
      At the end of the season, 8 teams will make the playoffs. The first round of playoffs will commence in Week 15. Each
      team that wins its division, North, South, East, and West (4), and the 4 wild card teams that finish with the best
      records overall from the remaining teams, will receive a playoff berth. Each playoff matchup will last one week, and
      the winner will advance. Week 18 will not be used.
    </p>
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
        <div class="round-title">Round 1 <br /><small>(Week 15)</small></div>

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
        <div class="round-title">Round 2 <br /><small>(Week 16)</small></div>

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
        <div class="round-title">Finals <br /><small>(Week 17)</small></div>

        <div class="matchup">
          <div class="championship">Champ</div>
          <div class="tbd">TBD</div>
          <div class="tbd">TBD</div>
        </div>
      </div>
    </div>

    <p>
      A similar bracket for the remaining 8 teams, called the "Toilet Bowl," will be formed following the same logic.
    </p>

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

    <h3 class="subSectionHeading" bind:this={threeFour}>3.4 Draft Order Determination</h3>
    <p>
      In an effort to combat tanking during the regular season and encourage managers to stay competitive through the playoffs,
      you can earn ping pong balls based on your regular season record and by placing 1st through 3rd in the Toilet Bowl. See
      below:
    </p>

    <div class="subBlock">
      <table class="draft-order-table compact-mobile-table">
        <thead>
          <tr class="table-header">
            <th>Name</th>
            <th>R_Seed</th>
            <th>Balls</th>
            <th>Pick%</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>TM1</td><td>1st</td><td>0</td><td>0%</td></tr>
          <tr><td>TM2</td><td>2nd</td><td>0</td><td>0%</td></tr>
          <tr><td>TM3</td><td>3rd</td><td>0</td><td>0%</td></tr>
          <tr><td>TM4</td><td>4th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM5</td><td>5th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM6</td><td>6th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM7</td><td>7th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM8</td><td>8th</td><td>1</td><td>8%</td></tr>
          <tr><td>TM9</td><td>9th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM10</td><td>10th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM11</td><td>11th</td><td>3</td><td>23%</td></tr>
          <tr><td>TM12</td><td>12th</td><td>2</td><td>15%</td></tr>
          <tr><td>TM13</td><td>13th</td><td>1</td><td>8%</td></tr>
          <tr><td>TM14</td><td>14th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM15</td><td>15th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM16</td><td>16th</td><td>0</td><td>0%</td></tr>
          <tr class="total-row">
            <td colspan="3">REG SEASON TOTAL PING PONG BALLS:</td>
            <td>8</td>
          </tr>
        </tbody>
      </table>

      <table class="draft-order-table compact-mobile-table">
        <thead>
          <tr class="table-header">
            <th>Name</th>
            <th>P_Seed</th>
            <th>Balls</th>
            <th>Pick%</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>TM1</td><td>1st</td><td>16th</td><td>0%</td></tr>
          <tr><td>TM2</td><td>2nd</td><td>15th</td><td>0%</td></tr>
          <tr><td>TM3</td><td>3rd</td><td>TBD</td><td>0%</td></tr>
          <tr><td>TM4</td><td>4th</td><td>TBD</td><td>0%</td></tr>
          <tr><td>TM5</td><td>5th</td><td>TBD</td><td>0%</td></tr>
          <tr><td>TM6</td><td>6th</td><td>TBD</td><td>0%</td></tr>
          <tr><td>TM7</td><td>7th</td><td>TBD</td><td>0%</td></tr>
          <tr><td>TM8</td><td>8th</td><td>TBD</td><td>0%</td></tr>
          <tr><td>TM9</td><td>9th</td><td>3</td><td>23%</td></tr>
          <tr><td>TM10</td><td>10th</td><td>2</td><td>15%</td></tr>
          <tr><td>TM11</td><td>11th</td><td>1</td><td>8%</td></tr>
          <tr><td>TM12</td><td>12th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM13</td><td>13th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM14</td><td>14th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM15</td><td>15th</td><td>0</td><td>0%</td></tr>
          <tr><td>TM16</td><td>16th</td><td>0</td><td>0%</td></tr>
          <tr class="total-row">
            <td colspan="3">PLAYOFFS TOTAL PING PONG BALLS:</td>
            <td>6</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p>
      *TBD - The exact draft order will be determined using a lottery-style drawing with a ping pong machine. Each pick will be
      drawn randomly to ensure fairness.
    </p>

    <h3 class="subSectionHeading" bind:this={threeFive}>3.5 Draft Lottery FAAB Entry</h3>
    <p>
      Non-playoff teams may use FAAB to purchase one additional ping-pong entry for the #1 overall pick lottery.
    </p>
    <div class="subBlock">
      <ul>
        <li>Only non-playoff teams are eligible to purchase an entry.</li>
        <li>Each eligible team may purchase no more than one additional entry.</li>
        <li>The FAAB cost and purchase deadline will be announced by the Commissioner before the lottery is finalized.</li>
        <li>Purchased entries apply only to the lottery for the #1 overall pick and do not affect other draft positions unless otherwise stated by league rule.</li>
        <li>If a team does not have sufficient FAAB, it may not purchase an entry.</li>
      </ul>
    </div>

    <h2 class="sectionHeading" bind:this={four}>Section 4 Scoring System</h2>

    <h3 class="subSectionHeading" bind:this={fourOne}>4.1 Scoring System</h3>
    <p>For the complete scoring breakdown, please see the Sleeper fantasy app.</p>
    <p>The scoring system will never change without a majority league vote; 9 minimum votes are required.</p>

    <h2 class="sectionHeading" bind:this={five}>Section 5 Tanking Policy</h2>

    <h3 class="subSectionHeading" bind:this={fiveOne}>5.1 League Tanking Policy</h3>
    <p>
      Tanking may be a strategy that a manager employs to improve the team’s draft position. Please make sure to fully
      understand the potential consequences of tanking, which may include the following season’s strength of schedule. Leaving
      your lineup empty is not allowed, as this is considered "ghosting" your team. Ghosting will result in the manager being
      removed from the league. Please notify the Commissioner when tanking.
    </p>

    <h2 class="sectionHeading" bind:this={six}>Section 6 Replacing Managers</h2>

    <h3 class="subSectionHeading" bind:this={sixOne}>6.1 Removing Managers</h3>
    <p>
      A manager can be removed against their will in cases of repeatedly failing to set a valid lineup, confirmed collusion, or
      lack of participation in the Competition Committee, in-person draft, league chat, trade offers, or waiver wire. Staying
      active throughout the season is strongly encouraged, as inactivity may be considered grounds for removal.
    </p>
    <p>Three Strikes and You're Out Rule:</p>
    <p>
      If a manager’s team finishes 14th, 15th, or 16th in back-to-back seasons, they must plead their strategy to the
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

    <h2 class="sectionHeading" bind:this={seven}>Section 7 League Finances</h2>

    <h3 class="subSectionHeading" bind:this={sevenOne}>7.1 League Dues</h3>
    <p>League dues are set at ${dues} and are collected by the Commissioner. All managers must be fully paid by draft day of the season.</p>

    <h3 class="subSectionHeading" bind:this={sevenTwo}>7.2 Payout</h3>
    <p>League payout is structured as follows:</p>
    <p>Each Divisional Champion will receive a $25 payout.</p>
    <p>
      Commissioners will receive FAAB compensation equal to 25% of the maximum FAAB allowed for that season, evenly among
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
            <td class="ledger-currency">$</td>
            <td class="ledger-value">-</td>
          </tr>
          <tr>
            <td>Number of Owners</td>
            <td class="ledger-currency"></td>
            <td class="ledger-value">16</td>
          </tr>
          <tr>
            <td>Cost to Play (Fee)</td>
            <td class="ledger-currency">$</td>
            <td class="ledger-value">100.00</td>
          </tr>
          <tr>
            <td>Total Collected 2026</td>
            <td class="ledger-currency">$</td>
            <td class="ledger-value">1,600.00</td>
          </tr>
          <tr>
            <td>2025 Rolling and 2026 Collect</td>
            <td class="ledger-currency">$</td>
            <td class="ledger-value">1,600.00</td>
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
            <td>Division Winners Payout</td>
            <td class="ledger-value">$ 100.00</td>
            <td class="ledger-value">$ 425.00</td>
          </tr>
          <tr>
            <td>Commissioner FAAB Compensation</td>
            <td class="ledger-value">25% Max FAAB</td>
            <td class="ledger-value">Seasonal</td>
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
            <td>Rings</td>
            <td class="ledger-value">$ 55.00</td>
            <td class="ledger-value">$ 340.00</td>
          </tr>

          <tr class="ledger-highlight-row">
            <td>Rolling to 2027</td>
            <td></td>
            <td class="ledger-value">$ 340.00</td>
          </tr>

          <tr class="ledger-section-row">
            <th>Outstanding Items</th>
            <th></th>
            <th></th>
          </tr>
          <tr>
            <td>Ring</td>
            <td></td>
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
        </tbody>
      </table>
    </div>

    <h3 class="subSectionHeading" bind:this={sevenThree}>7.3 Raising Dues</h3>
    <p>
      A ⅔ majority vote (11) is required in order to raise league dues. In the event that a manager is no longer financially
      comfortable with the buy-in, finding a co-manager to split the cost is recommended.
    </p>
  </div>
</div>
