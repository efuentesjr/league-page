<script>
  import { dues } from '$lib/utils/helper';

  let one, oneOne, oneOneOne; // 1.1 Positional Breakdown
  let oneTwo, oneTwoOne, oneTwoTwo; // 1.2 Divisions
  let oneThree, oneThreeOne, oneThreeTwo, oneThreeThree, oneThreeFour, oneThreeFive; // 1.3 Trading
  let oneFour, oneFourOne; // 1.4 Waiver Wire
  let two, twoOne; // 2.1 Playoffs
  let three, threeOne, threeTwo, threeThree, threeFour; // 3. Drafting
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
      radial-gradient(circle at top, rgba(178, 140, 56, 0.12), transparent 25%),
      linear-gradient(180deg, #09111f 0%, #0d1728 35%, #111827 100%);
    color: #e5e7eb;
  }

  :global(h1, h2, h3, h4, h5) {
    color: #f8fafc;
  }

  :global(p),
  :global(li) {
    color: #cbd5e1;
    line-height: 1.7;
  }

  :global(ul) {
    padding-left: 1.4rem;
  }

  :global(ul li) {
    margin-bottom: 3px;
  }

  :global(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 2rem 0;
  }

  .constitution-shell {
    width: min(1100px, 92%);
    margin: 5rem auto 8rem;
  }

  .constitution-hero {
    background: linear-gradient(135deg, rgba(14, 23, 38, 0.96), rgba(19, 34, 56, 0.92));
    border: 1px solid rgba(212, 175, 55, 0.22);
    border-radius: 22px;
    box-shadow:
      0 10px 35px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    padding: 2rem 1.5rem 1.75rem;
    margin-bottom: 1.5rem;
  }

  .eyebrow {
    display: inline-block;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #d4af37;
    margin-bottom: 0.75rem;
    font-weight: 700;
  }

  .hero-title {
    margin: 0;
    text-align: center;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.05;
    letter-spacing: 0.03em;
  }

  .hero-subtitle {
    margin: 1rem auto 0;
    max-width: 760px;
    text-align: center;
    color: #94a3b8;
    font-size: 0.98rem;
  }

  .toc-card {
    margin-top: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 1.25rem 1.1rem;
    backdrop-filter: blur(4px);
  }

  .toc-title {
    margin: 0 0 1.25rem;
    text-align: center;
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #d4af37;
  }

  .toc-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.2rem 2rem;
  }

  .toc-group h3,
  .toc-group h4,
  .toc-group h5 {
    margin: 0;
  }

  .toc-group h3 {
    margin-bottom: 0.6rem;
    font-size: 1rem;
    color: #f8fafc;
  }

  .toc-group h4,
  .toc-group h5 {
    font-size: 0.92rem;
    color: #cbd5e1;
    margin-bottom: 0.45rem;
    font-weight: 500;
  }

  .constitution-body {
    margin-top: 1.5rem;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.96));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 22px;
    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.28);
    padding: 2rem 1.4rem 3rem;
  }

  .sectionHeading {
    margin: 3.2rem 0 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid rgba(212, 175, 55, 0.24);
    font-size: clamp(1.5rem, 3vw, 2rem);
    color: #f8fafc;
  }

  .subSectionHeading {
    margin: 1.8rem 0 0.85rem;
    font-size: 1.25rem;
    color: #dbeafe;
  }

  h4 {
    margin-top: 1.25rem;
    margin-bottom: 0.6rem;
    margin-left: 0;
    text-decoration: none;
    font-size: 1.05rem;
    color: #f8fafc;
  }

  h5 {
    margin-left: 0;
    font-size: 0.95rem;
    color: #cbd5e1;
  }

  .subBlock {
    margin-left: 1.2rem;
    padding-left: 1rem;
    border-left: 3px solid rgba(212, 175, 55, 0.2);
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
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    overflow: hidden;
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
    text-align: left;
    color: #e5e7eb;
  }

  .table-header,
  table thead tr {
    background: linear-gradient(180deg, rgba(180, 34, 34, 0.88), rgba(111, 20, 20, 0.88));
  }

  .table-header th,
  table thead th {
    color: #fff;
  }

  .no-border td {
    border-bottom: none;
  }

  .no-border + tr td {
    border-top: none;
  }

  .playoffs,
  .consolation {
    background-color: #1d4ed8;
    color: white;
  }

  .total-row td {
    font-weight: 700;
    color: #f5d56b;
    background: rgba(212, 175, 55, 0.08);
  }

  .scoring-table {
    margin: 1rem 0 1.25rem;
  }

  .scoring-table input {
    width: 70px;
    padding: 0.45rem 0.5rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(2, 6, 23, 0.65);
    color: #f8fafc;
  }

  .description {
    font-size: 0.82rem;
    color: #94a3b8;
    margin-top: 0.25rem;
  }

  .bracket-container {
    display: flex;
    gap: 16px;
    margin: 1.5rem 0;
    padding: 1rem;
    justify-content: flex-start;
    overflow-x: auto;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
  }

  .round {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 0;
    margin: 0;
    min-width: 120px;
  }

  .round-title {
    font-size: 0.82rem;
    text-align: left;
    color: #d4af37;
    margin-bottom: 6px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .matchup {
    background: linear-gradient(180deg, #1e293b, #0f172a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 10px;
    border-radius: 10px;
    width: 110px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22);
  }

  .team,
  .tbd,
  .championship {
    font-weight: 700;
    text-align: left;
    width: 100%;
    font-size: 0.74rem;
    margin: 0.08rem 0;
  }

  .team {
    color: #f8fafc;
  }

  .tbd {
    color: #94a3b8;
  }

  .championship {
    font-size: 0.8rem;
    color: #f5d56b;
  }

  .round:nth-child(2) .matchup {
    margin-top: 42px;
  }

  .round:nth-child(3) .matchup {
    margin-top: 85px;
  }

  .bookkeeping-card {
    width: 100%;
    margin: 1.5rem 0;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
  }

  .bookkeeping-card h2,
  .bookkeeping-card h3 {
    margin-top: 0;
  }

  @media (max-width: 700px) {
    .toc-grid {
      grid-template-columns: 1fr;
    }

    .constitution-shell {
      width: min(96%, 96%);
      margin-top: 2rem;
    }

    .constitution-hero,
    .constitution-body {
      padding: 1.25rem 1rem 2rem;
      border-radius: 16px;
    }

    .hero-title {
      font-size: 1.7rem;
      line-height: 1.1;
    }

    .hero-subtitle {
      font-size: 0.9rem;
      line-height: 1.5;
      margin-top: 0.9rem;
    }

    .toc-title {
      font-size: 0.95rem;
      margin-bottom: 1rem;
    }

    .toc-group h3 {
      font-size: 0.95rem;
    }

    .toc-group h4,
    .toc-group h5 {
      font-size: 0.86rem;
      line-height: 1.35;
    }

    .sectionHeading {
      font-size: 1.25rem;
      margin-top: 1.75rem;
      padding-bottom: 0.6rem;
    }

    .subSectionHeading {
      font-size: 1rem;
      margin-top: 1rem;
      line-height: 1.35;
    }

    h4 {
      font-size: 0.95rem;
      line-height: 1.35;
    }

    h5 {
      font-size: 0.85rem;
      line-height: 1.35;
    }

    .subBlock {
      margin-left: 0.4rem;
      padding-left: 0.8rem;
    }

    .draft-order-table,
    .scoring-table table,
    table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
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
          <h4 class="noUnderscore clickable" on:click={() => goToSection(oneThree)}>1.3 Trading</h4>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeOne)}>1.3.1 Trade Collusion</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeTwo)}>1.3.2 Lending Players Prohibition</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeThree)}>1.3.3 Trade Deadline</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeFour)}>1.3.4 Trade Restrictions</h5>
          <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeFive)}>1.3.5 Veto/Trade Process</h5>
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

    <h3 class="subSectionHeading" bind:this={oneThree}>1.3 Trading</h3>
    <p>
      Tradable assets include players, draft picks, and FAAB dollars. Conditional trades are also permitted. For example, a
      manager may trade for a quarterback who is speculated to be benched. The condition could be as follows: Team A trades a
      quarterback to Team B for a first-round pick, with the condition that the quarterback starts for the rest of the season
      (barring injury). If the quarterback is benched, the draft pick is reduced to a second-round pick instead.
    </p>

    <h4 bind:this={oneThreeOne}>1.3.1 Trade Collusion</h4>
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

    <h4 bind:this={oneThreeTwo}>1.3.2 Lending Players Prohibition</h4>
    <div class="subBlock">
      <p>
        For trades involving any player ranked in the top 35, reacquisition by the original team is prohibited for two years
        after the trade, with no offseason exception. These players will be tagged with “NO TRADE BACK TO/FROM” to enforce this
        rule.
      </p>
    </div>

    <h4 bind:this={oneThreeThree}>1.3.3 Trade Deadline</h4>
    <div class="subBlock">
      <p>The trade deadline will be set for Wednesday of Week 7 at 8:00 p.m. CST.</p>
    </div>

    <h4 bind:this={oneThreeFour}>1.3.4 Trade Restrictions</h4>
    <div class="subBlock">
      <p>
        You may not trade draft picks that are more than three drafts away. For example, during the 2021 season you cannot
        trade any picks in or after the 2025 draft.
      </p>
    </div>

    <h4 bind:this={oneThreeFive}>1.3.5 Veto/Trade Process</h4>
    <div class="subBlock">
      <p>Only the Commissioner may veto trades. See Section 1.3 Trading.</p>
    </div>

    <h3 bind:this={oneFour}>1.4 Waiver Wire</h3>
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

    <h3 bind:this={twoOne}>2.1 Playoffs</h3>
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

    <h3 bind:this={threeOne}>3.1 Drafts</h3>
    <p>
      The draft will consist of rookies only and will take place over 5 rounds, with a 5-minute limit per pick. To accommodate
      incoming players, bench sizes will temporarily expand by five spots at the start of the season, following the Competition
      Committee meeting. These additional spots will be removed shortly after the draft, at which point all teams must reduce
      their rosters to comply with standard roster limits.
    </p>
    <p>Any spots not filled during the draft can be filled immediately afterward from the waiver wire.</p>

    <h3 bind:this={threeTwo}>3.2 Draft Order</h3>
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

    <h3 bind:this={threeThree}>3.3 Draft Day Trades</h3>
    <p>
      If a trade is being negotiated during the draft, either party may request that the Commissioner pause the draft to allow
      additional time for trade discussions.
    </p>

    <h3 bind:this={threeFour}>3.4 Draft Order Determination</h3>
    <p>
      In an effort to combat tanking during the regular season and encourage managers to stay competitive through the playoffs,
      you can earn ping pong balls based on your regular season record and by placing 1st through 3rd in the Toilet Bowl. See
      below:
    </p>

    <div class="subBlock">
      <table class="draft-order-table">
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

      <table class="draft-order-table">
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

    <h2 class="sectionHeading" bind:this={four}>Section 4 Scoring System</h2>

    <h3 bind:this={fourOne}>4.1 Scoring System</h3>
    <p>For the complete scoring breakdown, please see the Sleeper fantasy app.</p>

    <div class="scoring-table">
      <table>
        <tbody>
          <tr>
            <td>Passing Yards</td>
            <td>
              <input type="text" value="30" /> yards
              <div class="description">(1 point every 30 yards)</div>
            </td>
          </tr>
          <tr>
            <td>Passing TD</td>
            <td><input type="text" value="4" /></td>
          </tr>
          <tr>
            <td>Passing 1st Down</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>2-Pt Conversion</td>
            <td><input type="text" value="2" /></td>
          </tr>
          <tr>
            <td>Pass Intercepted</td>
            <td><input type="text" value="-1" /></td>
          </tr>
          <tr>
            <td>Pick 6 Thrown</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>Pass Completed</td>
            <td><input type="text" value="0.3" /></td>
          </tr>
          <tr>
            <td>Incomplete Pass</td>
            <td><input type="text" value="-0.3" /></td>
          </tr>
          <tr>
            <td>Pass Attempts</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>QB Sacked</td>
            <td><input type="text" value="-0.2" /></td>
          </tr>
          <tr>
            <td>40+ Yard Completion Bonus</td>
            <td><input type="text" value="0.1" /></td>
          </tr>
          <tr>
            <td>40+ Yard Pass TD Bonus</td>
            <td><input type="text" value="0.1" /></td>
          </tr>
          <tr>
            <td>50+ Yard Pass TD Bonus</td>
            <td><input type="text" value="0.3" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="scoring-table">
      <table>
        <tbody>
          <tr>
            <td>Rushing Yards</td>
            <td>
              <input type="text" value="10" /> yards
              <div class="description">(1 point every 10 yards)</div>
            </td>
          </tr>
          <tr>
            <td>Rushing TD</td>
            <td><input type="text" value="6" /></td>
          </tr>
          <tr>
            <td>Rushing 1st Down</td>
            <td><input type="text" value="1" /></td>
          </tr>
          <tr>
            <td>2-Pt Conversion</td>
            <td><input type="text" value="2" /></td>
          </tr>
          <tr>
            <td>Rush Attempts</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>40+ Yard Rush Bonus</td>
            <td><input type="text" value="0.3" /></td>
          </tr>
          <tr>
            <td>40+ Yard Rush TD Bonus</td>
            <td><input type="text" value="0.1" /></td>
          </tr>
          <tr>
            <td>50+ Yard Rush TD Bonus</td>
            <td><input type="text" value="0.3" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="scoring-table">
      <table>
        <tbody>
          <tr>
            <td>Reception</td>
            <td><input type="text" value="1" /></td>
          </tr>
          <tr>
            <td>Receiving Yards</td>
            <td>
              <input type="text" value="10" /> yards
              <div class="description">(1 point every 10 yards)</div>
            </td>
          </tr>
          <tr>
            <td>Receiving TD</td>
            <td><input type="text" value="6" /></td>
          </tr>
          <tr>
            <td>Receiving 1st Down</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>2-Pt Conversion</td>
            <td><input type="text" value="2" /></td>
          </tr>
          <tr>
            <td>0-4 Yard Reception Bonus</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>5-9 Yard Reception Bonus</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>10-19 Yard Reception Bonus</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>20-29 Yard Reception Bonus</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>30-39 Yard Reception Bonus</td>
            <td><input type="text" value="0.1" /></td>
          </tr>
          <tr>
            <td>40+ Yard Reception Bonus</td>
            <td><input type="text" value="0.2" /></td>
          </tr>
          <tr>
            <td>40+ Yard Reception TD Bonus</td>
            <td><input type="text" value="0.1" /></td>
          </tr>
          <tr>
            <td>50+ Yard Reception TD Bonus</td>
            <td><input type="text" value="0.4" /></td>
          </tr>
          <tr>
            <td>Reception Bonus - RB</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>Reception Bonus - WR</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>Reception Bonus - TE</td>
            <td><input type="text" value="0.6" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="scoring-table">
      <table>
        <tbody>
          <tr>
            <td>1st Down Bonus - TE</td>
            <td><input type="text" value="1" /></td>
          </tr>
          <tr>
            <td>Fumble</td>
            <td><input type="text" value="0" /></td>
          </tr>
          <tr>
            <td>Fumble Lost</td>
            <td><input type="text" value="-2" /></td>
          </tr>
          <tr>
            <td>Fumble Recovery TD</td>
            <td><input type="text" value="6" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <p>The scoring system will never change without a majority league vote; 9 minimum votes are required.</p>

    <h2 class="sectionHeading" bind:this={five}>Section 5 Tanking Policy</h2>

    <h3 bind:this={fiveOne}>5.1 League Tanking Policy</h3>
    <p>
      Tanking may be a strategy that a manager employs to improve the team’s draft position. Please make sure to fully
      understand the potential consequences of tanking, which may include the following season’s strength of schedule. Leaving
      your lineup empty is not allowed, as this is considered "ghosting" your team. Ghosting will result in the manager being
      removed from the league. Please notify the Commissioner when tanking.
    </p>

    <h2 class="sectionHeading" bind:this={six}>Section 6 Replacing Managers</h2>

    <h3 bind:this={sixOne}>6.1 Removing Managers</h3>
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

    <h3 bind:this={sixTwo}>6.2 Replacing Managers</h3>
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

    <h3 bind:this={sixThree}>6.3 Quitting/Replacement of Inactive Managers</h3>
    <p>In the event that a manager chooses to quit the league, the following conditions must be met:</p>
    <p>1. A reigning champion cannot leave the league; they must return to defend or forfeit their championship.</p>
    <p>2. If future draft picks are traded, a manager cannot leave their team. If you plan on quitting, please keep this in mind.</p>
    <p>3. Once you leave the MFFL, you can never return. Keep in mind that if you quit or are removed from the league, you will not be invited back.</p>

    <p>A FAAB bonus may be added to new incoming managers for their initial season.</p>

    <h2 class="sectionHeading" bind:this={seven}>Section 7 League Finances</h2>

    <h3 bind:this={sevenOne}>7.1 League Dues</h3>
    <p>League dues are set at ${dues} and are collected by the Commissioner. All managers must be fully paid by draft day of the season.</p>

    <h3 bind:this={sevenTwo}>7.2 Payout</h3>
    <p>League payout is structured as follows:</p>

    <div class="bookkeeping-card">
      <h2 style="text-align: center; background-color: #333333; color: white; padding: 5px; margin: 0;">2025 League Bookkeeping</h2>

      <h3 style="background-color: #333333; color: white; padding: 5px; margin: 0;">Incoming Money</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="background-color: #800000; border: 1px solid #333; padding: 5px;">Description</th>
            <th style="background-color: #800000; border: 1px solid #333; padding: 5px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">Rolling From 2024</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 50.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">Number of Owners</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">16</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">Cost to Play (Fee)</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 75.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">Total Collect</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 1,250.00</td>
          </tr>
        </tbody>
      </table>

      <h3 style="background-color: #333333; color: white; padding: 5px; margin: 0;">Outgoing Payments</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="background-color: #800000; border: 1px solid #333; padding: 5px;">Description</th>
            <th style="background-color: #800000; border: 1px solid #333; padding: 5px;">Amount</th>
            <th style="background-color: #800000; border: 1px solid #333; padding: 5px;">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">1st Place Payout</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 1,000.00</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 250.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">2nd Place Payout</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 75.00</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 175.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">Trophy Plaque</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 5.00</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 170.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">Trophy Shipment (Ring JDD)</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 15.00</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 155.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">Rings x4 NBow, JRod, GCall, JDD</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 155.00</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 0.00</td>
          </tr>
        </tbody>
      </table>

      <h3 style="background-color: #333333; color: white; padding: 5px; margin: 0;">Rolling Budget</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="background-color: #800000; border: 1px solid #333; padding: 5px;">Description</th>
            <th style="background-color: #800000; border: 1px solid #333; padding: 5px;">Amount</th>
            <th style="background-color: #800000; border: 1px solid #333; padding: 5px;">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #333; padding: 5px;">Surplus Budget</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">-</td>
            <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 0.00</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 bind:this={sevenThree}>7.3 Raising Dues</h3>
    <p>
      A ⅔ majority vote (11) is required in order to raise league dues. In the event that a manager is no longer financially
      comfortable with the buy-in, finding a co-manager to split the cost is recommended.
    </p>
  </div>
</div>
