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
            const top = section.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({left: 0, top, behavior: 'smooth'});
        }
    </script>

<style>

      /* Basic styling for the table */
      .draft-order-table {
        width: 80%;
        border-collapse: collapse;
        text-align: center;
        font-family: Arial, sans-serif;
      }

      .draft-order-table th,
      .draft-order-table td {
        padding: 10px;
        border: 1px solid #ccc; /* Light gray border */
      }

      .playoffs,
      .consolation {
        background-color: #007acc;
        color: white;
      }

      .table-header {
        background-color: #b0e0ff;
      }

      /* Custom style to remove bottom border from specific rows */
      .no-border td {
        border-bottom: none;
      }

      /* Remove the top border of the next row to create a seamless connection */
      .no-border + tr td {
        border-top: none;
      }

      /* Basic styling for the table */
      .draft-order-table {
        width: 75%;
        border-collapse: collapse;
        text-align: center;
        font-family: Arial, sans-serif;
      }

      .draft-order-table th,
      .draft-order-table td {
        padding: 10px;
        border: 1px solid #ccc; /* Changed border color to light gray (#ccc) */
      }

      .playoffs,
      .consolation {
        background-color: #007acc;
        color: white;
      }

      .table-header {
        background-color: #b0e0ff;
      }

    .constitution {
        position: relative;
        z-index: 1;
        width: 92%;
        max-width: 800px;
        margin: 8em auto 10em;
    }

    h1 {
        font-size: 2em;
        line-height: 1.2em;
        text-align: center;
        margin: 2em 0 1.5em;
    }

    h2 {
        font-size: 1.5em;
        line-height: 1.2em;
    }

    h3 {
        text-decoration: underline;
        font-size: 1.3em;
        line-height: 1.2em;
    }

    h4 {
        text-decoration: underline;
        margin-left: 2em;
        font-size: 1.2em;
        line-height: 1.2em;
    }

    h5 {
        margin-left: 6em;
        font-size: 0.8em;
        line-height: 1.1em;
    }

    .subBlock {
        margin-left: 2.4em;
    }

    .sectionHeading {
        margin: 4em 0 1.5em;
    }

    .subSectionHeading {
        margin: 1.5em 0 1.5em;
    }

    .underscore {
        text-decoration: underline;
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
    }

    .clickable:hover {
        color: #00316b;
    }

    p {
        color: #777;
    }

    /* General Styling */
    .bracket-container {
        display: flex;
        gap: 10px; /* Reduced space between rounds */
        margin: 0; /* No extra margin */
        padding: 0;
        justify-content: flex-start; /* Align to the left */
    }

    .round {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Reduced gap between matchups */
        align-items: flex-start; /* Align content to the left in each round */
        padding: 0;
        margin: 0;
    }

    .round-title {
        font-size: 0.75em;
        text-align: left; /* Align title to the left */
        color: #aaa;
        margin-bottom: 5px;
    }

    .matchup {
        background-color: #3b3f4a;
        padding: 5px; /* Smaller padding for more compact boxes */
        border-radius: 4px;
        width: 90px; /* Reduced width */
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 0; /* Remove default margin */
    }

    /* Left-align teams without boxes */
    .team, .tbd, .championship {
        font-weight: bold;
        color: white;
        text-align: left; /* Align text to the left */
        width: 90px; /* Match width for alignment */
        font-size: 0.7em; /* Reduced font size */
        margin: 0; /* Remove default margin */
    }

    .tbd {
        color: #666;
    }

    .championship {
        font-size: 0.75em;
        color: orange;
    }

    /* Vertical spacing for alignment */
    .round:nth-child(2) .matchup {
        margin-top: 35px; /* Adjusted to vertically center with Round 1 */
    }

    .round:nth-child(3) .matchup {
        margin-top: 70px; /* Adjusted further for Finals */
    }

    /* Divisions Styling */
    .divisions-container {
        display: flex;
        justify-content: space-around;
        gap: 20px;
        flex-wrap: wrap;
    }

    .division {
        text-align: center;
        min-width: 150px;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        margin: 5px 0;
    }

        /* General Styling */
        .bracket-container {
            display: flex;
            gap: 10px; /* Reduced space between rounds */
            margin: 0; /* No extra margin */
            padding: 0;
            justify-content: flex-start; /* Align to the left */
        }

        .round {
            display: flex;
            flex-direction: column;
            gap: 8px; /* Reduced gap between matchups */
            align-items: flex-start; /* Align content to the left in each round */
            padding: 0;
            margin: 0;
        }

        .round-title {
            font-size: 0.75em;
            text-align: left; /* Align title to the left */
            color: #aaa;
            margin-bottom: 5px;
        }

        .matchup {
            background-color: #3b3f4a;
            padding: 5px; /* Smaller padding for more compact boxes */
            border-radius: 4px;
            width: 90px; /* Reduced width */
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin: 0; /* Remove default margin */
        }

        /* Left-align teams without boxes */
        .team, .tbd, .championship {
            font-weight: bold;
            color: white;
            text-align: left; /* Align text to the left */
            width: 90px; /* Match width for alignment */
            font-size: 0.7em; /* Reduced font size */
            margin: 0; /* Remove default margin */
        }

        .tbd {
            color: #666;
        }

        .championship {
            font-size: 0.75em;
            color: orange;
        }

        /* Vertical spacing for alignment */
        .round:nth-child(2) .matchup {
            margin-top: 35px; /* Adjusted to vertically center with Round 1 */
        }

        .round:nth-child(3) .matchup {
            margin-top: 70px; /* Adjusted further for Finals */
        }
    </style>


<div class="constitution">
    <h1 class="noUnderscore">MANOR FANTASY FOOTBALL LEAGUE CONSTITUTION</h1>
    
    <h2 class="noUnderscore">TABLE OF CONTENTS</h2>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(one)}>Section 1: Roster</h3>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(oneOne)}>1.1 Positional Breakdown</h4>
    <h5 class="noUnderscore clickable" on:click={() => goToSection(oneOneOne)}>1.1.1 Position Maximums</h5>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(oneTwo)}>1.2 Divisions</h4>
    <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoOne)}>1.2.1 Divisional Structure</h5>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(oneThree)}>1.3 Trading</h4>
    <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeOne)}>1.3.1 Trade Collusion</h5>
    <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeTwo)}>1.3.2 Lending Players Prohibition</h5>
    <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeThree)}>1.3.3 Trade Deadline</h5>
    <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeFour)}>1.3.4 Trade Restrictions</h5>
    <h5 class="noUnderscore clickable" on:click={() => goToSection(oneThreeFive)}>1.3.5 Veto/Trade Process</h5>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(oneFour)}>1.4 Waiver Wire</h4>
    <h5 class="noUnderscore clickable" on:click={() => goToSection(oneFourOne)}>1.4.1 Waiver Wire/FAAB Collusion</h5>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(two)}>Section 2: Postseason</h3>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(twoOne)}>2.1 Playoffs</h4>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(three)}>Section 3: Drafting</h3>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(threeOne)}>3.1 Draft Order</h4>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(threeTwo)}>3.2 Rookie Drafts</h4>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(threeThree)}>3.3 Draft Day Trades</h4>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(threeFour)}>3.4 Draft Order Determination</h4>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(four)}>Section 4: Scoring System</h3>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(fourOne)}>4.1 Voting on Scoring System</h4>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(five)}>Section 5: Tanking Policy</h3>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(fiveOne)}>5.1 League Tanking Policy</h4>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(six)}>Section 6: Replacing Managers</h3>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(sixOne)}>6.1 Removing Managers</h4>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(sixTwo)}>6.2 Replacing Managers</h4>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(sixThree)}>6.3 Replacement Incentive</h4>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(seven)}>Section 7: League Finances</h3>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(sevenOne)}>7.1 League Dues</h4>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(sevenTwo)}>7.2 Payout</h4>
    <h4 class="noUnderscore clickable" on:click={() => goToSection(sevenThree)}>7.3 Raising Dues</h4>

    <hr />
</div>
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
        <p>10 Bench (Expanded by 5 between the competition committee and draft day during the off-season).</p>
        <p>3 IR Spots (Player must be labeled as IR, Out, or Covid in the Sleeper App).</p>
        <p>4 Taxi Squad (You may keep 2nd year players in the taxi squad, but only true rookies will be able to move in and out).</p>

        <h4 bind:this={oneOneOne}>1.1.1 Position Maximums</h4>
        <div class="subBlock">
            <table class="positionMaximums">
                <tr><td>QB</td><td class="right">none</td></tr>
                <tr><td>RB</td><td class="right">none</td></tr>
                <tr><td>WR</td><td class="right">none</td></tr>
                <tr><td>TE</td><td class="right">none</td></tr>
            </table>
        </div>

        <h3 class="subSectionHeading" bind:this={oneTwo}>1.2 Divisions</h3>
        <h4 bind:this={oneTwoOne}>1.2.1 Divisional Structure</h4>

        <div class="subBlock divisions-container">
            <div class="division">
            <h4>North Division</h4>
            <ul>
                <li>Team 1</li>
                <li>Team 2</li>
                <li>Team 3</li>
                <li>Team 4</li>
            </ul>
        </div>
        <div class="division">
            <h4>South Division</h4>
            <ul>
                <li>Team 5</li>
                <li>Team 6</li>
                <li>Team 7</li>
                <li>Team 8</li>
            </ul>
        </div>
        <div class="division">
            <h4>East Division</h4>
            <ul>
                <li>Team 9</li>
                <li>Team 10</li>
                <li>Team 11</li>
                <li>Team 12</li>
            </ul>
        </div>
        <div class="division">
            <h4>West Division</h4>
            <ul>
                <li>Team 13</li>
                <li>Team 14</li>
                <li>Team 15</li>
                <li>Team 16</li>
            </ul>
        </div>
    </div>

    <h4 bind:this={oneTwoTwo}>1.2.2 Divisions Reshuffle</h4>
    <div class="subBlock">
        <p>The league will reshuffle divisions every four years to keep competition fresh and balanced. The next reshuffle is scheduled for the 2027-2028 offseason or the start of the 2028 season.<p/>
    </div>
    <h3 class="subSectionHeading" bind:this={oneThree}>1.3 Trading</h3>
    <p>Tradable assets include players, draft picks, and FAAB dollars. Conditional trades are also permitted. For example, a manager may trade for a quarterback who is speculated to be benched. The condition could be as follows: Team A trades a quarterback to Team B for a first-round pick, with the condition that the quarterback starts for the rest of the season (barring injury). If the quarterback is benched, the draft pick is reduced to a second-round pick instead.</p>

    <h4 bind:this={oneThreeOne}>1.3.1 Trade Collusion</h4>
    <div class="subBlock">
        <p>If any team managers are suspected of offering or accepting bribes to enhance their own team or another manager’s team via trade, trading assets other than fantasy players, draft picks, or FAAB dollars, or otherwise found guilty of any form of collusion*, all parties involved in the trade will be subject to disciplinary action. Punishments may include the following:</p>
        <ul>
            <li>First Offense – Immediate reduction of FAAB budget by 80%</li>
            <li>Second Offense – An immediate freeze on all transaction types—including trades and waiver wire bids—for the next 17 weeks of regular season and playoff fantasy football games. This equates to a one-year suspension from all trades and waiver wire activity.</li>
            <li>Third Offense – A league meeting of all members not involved in any of the improper trades/activity in question will take place to discuss next steps.</li>
        </ul>
        <p>All trades that are found guilty of collusion, will be reversed/denied. If the trade had affected the outcome of previous games, the results of those games will be revised.</p>
    </div>

    <h4 bind:this={oneThreeTwo}>1.3.2 Lending Players Prohibition</h4>
    <div class="subBlock">
        <p>For trades involving any player ranked in the top 35, re-acquisition by the original team is prohibited for two years after the trade, with no offseason exception. These players will be tagged with “NO TRADE BACK TO/FROM” to enforce this rule.</p>
    </div>
    
    <h4 bind:this={oneThreeThree}>1.3.3 Trade Deadline</h4>
    <div class="subBlock">
        <p>The trade deadline will be set for the Wednesday of week 7 at 8:00pm CST</p>
    </div>
    
    <h4 bind:this={oneThreeFour}>1.3.4 Trade Restrictions</h4>
    <div class="subBlock">
        <p>You will not be able to trade draft picks that are more than 3 drafts away. For example, during the 2021 season you cannot trade any picks in or after the 2025 draft.</p>
    </div>
    
    <h4 bind:this={oneThreeFive}>1.3.5 Veto/Trade Process</h4>
    <div class="subBlock">
        <p>Only the Commissioner may veto trades. See Sections "1.2 Trading"</p>
    </div>

    <h3 bind:this={oneFour}>1.4 Waiver Wire</h3>
    <p>Beginning in the 2023 season, MFFL will award bonus FAAB (Free Agent Acquisition Budget) dollars to managers who attend and actively participate in the league’s Competition Committee meetings and the in-person draft. Out-of-town managers must follow along and participate live during the draft to qualify—auto-drafting is not allowed.</p>
    
    <p>FAAB Waiver Wire System: Each team will begin the season with a Free Agent Acquisition Budget (FAAB) between $100 and $200, with the exact amount announced by the Commissioner before the season starts. No $0 bids are allowed. Waiver bids will process every Thursday at 2:00 a.m.</p>

    <p>FAAB budgets carry over to the next season, to the maximum amount of $999.</p>

    <h4 bind:this={oneFourOne}>1.4.1 Waiver Wire/FAAB Collusion</h4>
    <div class="subBlock">
        <p>Collusion includes any coordinated efforts to manipulate the waiver wire or FAAB system for an unfair advantage. This includes, but is not limited to:</p>
        <ul>
            <li>Pooling FAAB budgets between teams.</li>
            <li>Dropping a player with the intent of allowing a specific team to acquire them, particularly if it’s known that the team with the highest FAAB will likely pick up the player.</li>
        </ul>
        <p>The Commissioner reserves the right to investigate any suspicious bidding or dropping patterns and to take disciplinary action if collusion is suspected. Punishments for FAAB/waiver wire collusion may include FAAB penalties, transaction freezes, or other sanctions as outlined in the league’s collusion policy.</p>
    </div>

   <h2 class="sectionHeading" bind:this={two}>Section 2 Postseason</h2>
    
    <h3 bind:this={twoOne}>2.1 Playoffs</h3>
    <p>At the end of the season 8 teams will make the playoffs. The first round of playoffs will commence in week 15. Each team that wins their division, North, South, East & West (4) and the 4 wild card teams that finish with the best records overall from the remaining teams, will receive a playoff berth. Each playoff matchup will only last one week and the winner will advance. Week 18 will not be used.</p>
    <p>The seed determination is as follows:<p/>
            <p>1. Overall record.<p/>
            <p>2. Points for.<p/>
            <p>3. Poins Against.<p/>
            <p>4. Coin flip. In extream cases.<p/>
    <p>The first-round matchups will be determined by end-of-season seeding | 1-vs-8 | 2-vs-7 | 3-vs-6 | 4-vs-5 |. In the following rounds, each team stays on their side of the bracket as they advance.<p/>

    <div class="bracket-container">
        <!-- Round 1 -->
        <div class="round">
            <div class="round-title">Round 1 <br><small>(Week 15)</small></div>

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

        <!-- Round 2 -->
        <div class="round">
            <div class="round-title">Round 2 <br><small>(Week 16)</small></div>

            <div class="matchup">
                <div class="tbd">#1/#8</div>
                <div class="tbd">#4/#5</div>
            </div>

            <div class="matchup">
                <div class="tbd">#3/#6</div>
                <div class="tbd">#2/#7</div>
            </div>
        </div>

        <!-- Finals -->
        <div class="round">
            <div class="round-title">Finals <br><small>(Week 17)</small></div>

            <div class="matchup">
                <div class="championship">🏆 Champ</div>
                <div class="tbd">TBD</div>
                <div class="tbd">TBD</div>
            </div>
        </div>
    </div>


    <p>A similar bracket for the remaining 8 teams, called the "Toilet Bowl," will be formed following the same logic.<p/>
    

    <h2 class="sectionHeading" bind:this={three}>Section 3 Drafting</h2>
    
    <h3 bind:this={threeOne}>3.1 Drafts</h3>
    <p>The draft will consist of rookies only and will take place over 5 rounds, with a 5-minute limit per pick. To accommodate incoming players, bench sizes will temporarily expand by five spots at the start of the season, following the Competition Committee meeting. These additional spots will be removed shortly after the draft, at which point all teams must reduce their rosters to comply with standard roster limits.</p>
    <p>Any spots not filled during the draft, can be filled immediately afterwards from the waiver wire.</p>

    <h3 bind:this={threeTwo}>3.2 Draft Order</h3>
    <p>The draft order each year will be a linear.</p>

    <div class="subBlock">
      <table class="draft-order-table">
        <thead>
          <tr class="table-header">
            <th>Round</th>
            <th>Picks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Round #1</td>
            <td>1-16</td>
          </tr>
          <tr>
            <td>Round #2</td>
            <td>1-16</td>
          </tr>
          <tr>
            <td>Round #3</td>
            <td>1-16</td>
          </tr>
          <tr>
            <td>Round #4</td>
            <td>1-16</td>
          </tr>
          <tr>
            <td>Round #5</td>
            <td>1-16</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p>If you trade future draft picks, you are required to actively manage your team through the playoffs in those seasons. If you fail to do so, the commissioners reserve the right to set your lineup to the best possible lineup each week in order to maintain the integrity of the draft picks.<p/>

    <h3 bind:this={threeThree}>3.3 Draft Day Trades</h3>
    <p>If a trade is being negotiated during the draft, either party may request that the Commissioner pause the draft to allow additional time for the trade discussions.</p>

    <h3 bind:this={threeFour}>3.4 Draft Order Determination</h3>
    <p>In an effort to combat tanking during the regular season and encourage managers to stay competitive through the playoffs, you can earn ping pong balls based on your regular season record and by placing 1st through 3rd in the Toilet Bowl. See below:</p>

<div class="subBlock">
    <table class="draft-order-table">
        <thead>
            <tr class="table-header">
                <th>Name</th>
                <th>Regular Season Seed</th>
                <th>Pick</th>
                <th>Pick %</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Team 1</td><td>1st</td><td>TBD</td><td>0%</td></tr>
            <tr><td>Team 2</td><td>2nd</td><td>TBD</td><td>0%</td></tr>
            <tr><td>Team 3</td><td>3rd</td><td>TBD</td><td>0%</td></tr>
            <tr><td>Team 4</td><td>4th</td><td>TBD</td><td>0%</td></tr>
            <tr><td>Team 5</td><td>5th</td><td>TBD</td><td>0%</td></tr>
            <tr><td>Team 6</td><td>6th</td><td>TBD</td><td>0%</td></tr>
            <tr><td>Team 7</td><td>7th</td><td>TBD</td><td>0%</td></tr>
            <tr><td>Team 8</td><td>8th</td><td>BALLS→ 2</td><td>14%</td></tr>
            <tr><td>Team 9</td><td>9th</td><td>BALLS→ 0</td><td>0%</td></tr>
            <tr><td>Team 10</td><td>10th</td><td>BALLS→ 0</td><td>0%</td></tr>
            <tr><td>Team 11</td><td>11th</td><td>BALLS→ 3</td><td>21%</td></tr>
            <tr><td>Team 12</td><td>12th</td><td>BALLS→ 2</td><td>14%</td></tr>
            <tr><td>Team 13</td><td>13th</td><td>BALLS→ 1</td><td>7%</td></tr>
            <tr><td>Team 14</td><td>14th</td><td>BALLS→ 0</td><td>0%</td></tr>
            <tr><td>Team 15</td><td>15th</td><td>BALLS→ 0</td><td>0%</td></tr>
            <tr><td>Team 16</td><td>16th</td><td>BALLS→ 0</td><td>0%</td></tr>
            <tr class="total-row">
                <td colspan="3">REG. SEASON TOTAL PING PONG BALLS:</td>
                <td>8</td>
            </tr>
        </tbody>
    </table>

    <table class="draft-order-table">
        <thead>
            <tr class="table-header">
                <th>Name</th>
                <th>Playoffs Seed</th>
                <th>Pick</th>
                <th>Pick %</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Team 1</td><td>1st</td><td>16th</td><td>0%</td></tr>
            <tr><td>Team 2</td><td>2nd</td><td>15th</td><td>0%</td></tr>
            <tr><td>Team 3</td><td>3rd</td><td>14th</td><td>0%</td></tr>
            <tr><td>Team 4</td><td>4th</td><td>13th</td><td>0%</td></tr>
            <tr><td>Team 5</td><td>5th</td><td>12th</td><td>0%</td></tr>
            <tr><td>Team 6</td><td>6th</td><td>11th</td><td>0%</td></tr>
            <tr><td>Team 7</td><td>7th</td><td>10th</td><td>0%</td></tr>
            <tr><td>Team 8</td><td>8th</td><td>9th</td><td>0%</td></tr>
            <tr><td>Team 9</td><td>TOILET BOWL 9th</td><td>BALLS→ 3</td><td>21%</td></tr>
            <tr><td>Team 10</td><td>10th</td><td>BALLS→ 2</td><td>14%</td></tr>
            <tr><td>Team 11</td><td>11th</td><td>BALLS→ 1</td><td>7%</td></tr>
            <tr><td>Team 12</td><td>12th</td><td>BALLS→ 0</td><td>0%</td></tr>
            <tr><td>Team 13</td><td>13th</td><td>0</td><td>0%</td></tr>
            <tr><td>Team 14</td><td>14th</td><td>0</td><td>0%</td></tr>
            <tr><td>Team 15</td><td>15th</td><td>BALLS→ 0</td><td>0%</td></tr>
            <tr><td>Team 16</td><td>16th</td><td>0</td><td>0%</td></tr>
            <tr class="total-row">
                <td colspan="3">PLAYOFFS TOTAL PING PONG BALLS:</td>
                <td>6</td>
            </tr>
        </tbody>
    </table>
</div>


    <p>*TBD - The exact draft order will be determined using a lottery-style drawing with a ping pong machine. Each pick will be drawn randomly to ensure fairness.<p/>

    <h2 class="sectionHeading" bind:this={four}>Section 4 Scoring System</h2>

    <h3 bind:this={fourOne}>4.1 Scoring System</h3>
    <p>For the complete scoring breakdown please see Sleeper fantasy app.</p>
    <div class="scoring-table">
      <table>
        <tr>
          <td>Passing Yards</td>
          <td>
            <input type="text" value="30"> yards
            <div class="description">(1 point every 30 yards)</div>
          </td>
        </tr>
        <tr>
          <td>Passing TD</td>
          <td>
            <input type="text" value="4">
          </td>
        </tr>
        <tr>
          <td>Passing 1st Down</td>
          <td>
            <input type="text" value="0">
          </td>
        </tr>
        <tr>
          <td>2-Pt Conversion</td>
          <td>
            <input type="text" value="2">
          </td>
        </tr>
        <tr>
          <td>Pass Intercepted</td>
          <td>
            <input type="text" value="-1">
          </td>
        </tr>
        <tr>
          <td>Pick 6 Thrown</td>
          <td>
            <input type="text" value="0">
          </td>
        </tr>
        <tr>
          <td>Pass Completed</td>
          <td>
            <input type="text" value="0.3">
          </td>
        </tr>
        <tr>
          <td>Incomplete Pass</td>
          <td>
            <input type="text" value="-0.3">
          </td>
        </tr>
        <tr>
          <td>Pass Attempts</td>
          <td>
            <input type="text" value="0">
          </td>
        </tr>
        <!-- New rows based on the image you provided -->
        <tr>
          <td>QB Sacked</td>
          <td>
            <input type="text" value="-0.2">
          </td>
        </tr>
        <tr>
          <td>40+ Yard Completion Bonus</td>
          <td>
            <input type="text" value="0.1">
          </td>
        </tr>
        <tr>
          <td>40+ Yard Pass TD Bonus</td>
          <td>
            <input type="text" value=".1">
          </td>
        </tr>
        <tr>
          <td>50+ Yard Pass TD Bonus</td>
          <td>
            <input type="text" value="0.3">
          </td>
        </tr>
      </table>
    </div>
    <div class="scoring-table">
      <table>
        <tr>
          <td>Rushing Yards</td>
          <td>
            <input type="text" value="10"> yards
            <div class="description">(1 point every 10 yards)</div>
          </td>
        </tr>
        <tr>
          <td>Rushing TD</td>
          <td>
            <input type="text" value="6">
          </td>
        </tr>
        <tr>
          <td>Rushing 1st Down</td>
          <td>
            <input type="text" value="1">
          </td>
        </tr>
        <tr>
          <td>2-Pt Conversion</td>
          <td>
            <input type="text" value="2">
          </td>
        </tr>
        <tr>
          <td>Rush Attempts</td>
          <td>
            <input type="text" value="0">
          </td>
        </tr>
        <tr>
          <td>40+ Yard Rush Bonus</td>
          <td>
            <input type="text" value="0.3">
          </td>
        </tr>
        <tr>
          <td>40+ Yard Rush TD Bonus</td>
          <td>
            <input type="text" vlaue="0.1">
          </td>
        </tr>
        <tr>
          <td>50+ Yard Rush TD Bonus</td>
          <td>
            <input type="text" value="0.3">
          </td>
        </tr>
      </table>
    </div>
    <div class="scoring-table">
        <table>
            <tr>
                <td>Reception</td>
                <td>
                    <input type="text" value="1">
                </td>
            </tr>
            <tr>
                <td>Receiving Yards</td>
                <td>
                    <input type="text" value="10"> yards
                    <div class="description">(1 point every 10 yards)</div>
                </td>
            </tr>
            <tr>
                <td>Receiving TD</td>
                <td>
                    <input type="text" value="6">
                </td>
            </tr>
            <tr>
                <td>Receiving 1st Down</td>
                <td>
                    <input type="text" value="0">
                </td>
            </tr>
            <tr>
                <td>2-Pt Conversion</td>
                <td>
                    <input type="text" value="2">
                </td>
            </tr>
            <tr>
                <td>0-4 Yard Reception Bonus</td>
                <td>
                    <input type="text" value="0">
                </td>
            </tr>
            <tr>
                <td>5-9 Yard Reception Bonus</td>
                <td>
                    <input type="text" value="0">
                </td>
            </tr>
            <tr>
                <td>10-19 Yard Reception Bonus</td>
                <td>
                    <input type="text" value="0">
                </td>
            </tr>
            <tr>
                <td>20-29 Yard Reception Bonus</td>
                <td>
                    <input type="text" value="0">
                </td>
            </tr>
            <tr>
                <td>30-39 Yard Reception Bonus</td>
                <td>
                    <input type="text" value="0.1">
                </td>
            </tr>
            <tr>
                <td>40+ Yard Reception Bonus</td>
                <td>
                    <input type="text" value="0.2">
                </td>
            </tr>
            <tr>
                <td>40+ Yard Reception TD Bonus</td>
                <td>
                    <input type="text" value="0.1">
                </td>
            </tr>
            <tr>
                <td>50+ Yard Reception TD Bonus</td>
                <td>
                    <input type="text" value="0.4">
                </td>
            </tr>
            <tr>
                <td>Reception bonus - rb</td>
                <td>
                    <input type="text" value="0">
                </td>
            </tr>
            <tr>
                <td>Reception bonus - wr</td>
                <td>
                    <input type="text" value="0">
                </td>
            </tr>
            <tr>
                <td>Reception bonus - te</td>
                <td>
                    <input type="text" value="0.6">
                </td>
            </tr>
        </table>
    </div>
    <div class="scoring-table">
        <table>
            <tr>
                <td>1st Down Bonus - TE</td>
                <td>
                    <input type="text" value="1">
                </td>
            </tr>
            <tr>
                <td>Fumble</td>
                <td>
                    <input type="text" value="0">
                </td>
            </tr>
            <tr>
                <td>Fumble Lost</td>
                <td>
                    <input type="text" value="-2">
                </td>
            </tr>
            <tr>
                <td>Fumble Recovery TD</td>
                <td>
                    <input type="text" value="6">
                </td>
            </tr>
        </table>
    </div>
    <p>The scoring system will never change without a majority league vote, 9 Minumum votes are required.</p>
    
    <h2 class="sectionHeading" bind:this={five}>Section 5 Tanking Policy</h2>
    
    <h3 bind:this={fiveOne}>5.1 League Tanking Policy</h3>
    <p>Tanking may be a strategy that a manager employs to improve the team’s draft position. Please make sure to fully understand the potential consequences of tanking, that may include the following season strength of schedule. Leaving your lineup empty is not allowed, as this is considered "ghosting" your team. Ghosting will result in the manager being removed from the league. Please notify the commissioner when tanking.</p>
    
    <h2 class="sectionHeading" bind:this={six}>Section 6 Replacing Managers</h2>
    
    <h3 bind:this={sixOne}>6.1 Removing Managers</h3>
    <p>A manager can be removed against their will in cases of repeatedly failing to set a valid lineup, confirmed collusion, or lack of participation in the competition committee, in-person draft, league chat, trade offers, or waiver wire. Staying active throughout the season is strongly encouraged, as inactivity may be considered grounds for removal.</p>
    <p>⚾ Three Strikes & You're Out Rule ⚾:<p/>
    <p>If a manager’s team finishes 15th or 16th 📉 in back-to-back seasons, they must plead their strategy 🗣️ to the commissioner & co-commissioners 👥. If approved, they’ll get one final season 🛑—a probation year ⏳—where their team must improve 📈 as outlined by the commissioners. Failure to do so? Strike three, and you’re out! 🚫<p/>
    <h3 bind:this={sixTwo}>6.2 Replacing Managers</h3>
    <p>When a manager is replaced, the commissioners will try to find a suitable candidate with some connection to at least a portion of the existing managers. A list of potential candidates is maintained by the commissioner. If you know of someone interested in joining, please provide their name to the commissioner. Priority will be given to managers who are eager to commit to a dynasty league and will be highly active within the league.</p>
    
    <h3 bind:this={sixThree}>6.3 Quitting/Replacement of Inactive Managers</h3>
    <p>In the event that a manager chooses to quit the league, the following conditions must be met:</p>
    <p>1. A reigning champion CANNOT leave the league; they must return to defend or lose their championship!<p/>
    <p>2. If future draft picks are traded, a manager CANNOT leave their team. If you plan on quitting, please keep this in mind.<p/>
    <p>3. Once you leave the MFFL, you can NEVER return. Keep in mind that if you quit or are removed from the league, you will not be invited back.<p/>

    <p>A FAAB bonus may be added to new incoming managers for the initial season.<p/>

    <h2 class="sectionHeading" bind:this={seven}>Section 7 League Finances</h2>
    
    <h3 bind:this={sevenOne}>7.1 League Dues</h3>
    <p>League dues are set at ${dues} and are collected by the commissioner. All managers must be fully paid by no later than Week 6 of the season.</p>
    
    <h3 bind:this={sevenTwo}>7.2 Payout</h3>
    <p>League payout is structured as follows:</p>

<div style="width: 95%; margin: 0 auto; font-family: Arial, sans-serif;">
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

    <h3 style="background-color: #333333; color: white; padding: 5px; margin: 0;">Outgoing Money</h3>
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
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 200.00</td>
            </tr>
            <tr>
                <td style="border: 1px solid #333; padding: 5px;">2nd Place Payout</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 75.00</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 125.00</td>
            </tr>
            <tr>
                <td style="border: 1px solid #333; padding: 5px;">Trophy Plaque</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 5.00</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 120.00</td>
            </tr>
            <tr>
                <td style="border: 1px solid #333; padding: 5px;">Trophy Shipment</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 25.00</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 95.00</td>
            </tr>
            <tr>
                <td style="border: 1px solid #333; padding: 5px;">Ring</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 35.00</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 60.00</td>
            </tr>
            <tr>
                <td style="border: 1px solid #333; padding: 5px;">Loser's T-shirt</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 10.00</td>
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 50.00</td>
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
                <td style="border: 1px solid #333; padding: 5px; text-align: right;">$ 50.00</td>
            </tr>
        </tbody>
    </table>
</div>


    
    <h3 bind:this={sevenThree}>7.3 Raising Dues</h3>
    <p>A ⅔ majority vote 11 is required in order to raise league dues. In the event that a manager is no longer financially comfortable with the buyin, finding a co-manager to split the cost is reccomended.</p>

