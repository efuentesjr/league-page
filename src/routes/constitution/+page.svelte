<script>
    import { dues } from '$lib/utils/helper';
    let one, oneOne, oneOneOne, oneTwo, oneTwoOne, oneTwoTwo, oneTwoThree, oneTwoFour, oneTwoFive, oneThree;
    let two, twoOne, twoTwo, twoThree;
    let three, threeOne;
    let four, fourOne, fourTwo;
    let five, fiveOne;
    let six, sixOne, sixTwo, sixThree;
    let seven, sevenOne, sevenTwo, sevenThree;

    const goToSection = (section) => {
        const top = section.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({left: 0, top, behavior: 'smooth'});
    }
</script>

<style>
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
</style>

<div class="constitution">
    <h1 class="noUnderscore">MANOR FANTASY FOOTBALL LEAGUE CONSTITUTION</h1>
    
    <h2 class="noUnderscore">TABLE OF CONTENTS</h2>
    
    <h3 class="noUnderscore clickable" on:click={() => goToSection(one)}>Section 1: Roster</h3>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(oneOne)}>1.1 Positional Breakdown</h4>
            <h5 class="noUnderscore clickable" on:click={() => goToSection(oneOneOne)}>1.1.1 Position Maximums</h5>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(oneTwo)}>1.2 Trading</h4>
            <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoOne)}>1.2.1 Trade Collusion</h5>
            <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoTwo)}>1.2.2 Lending Players Prohibition</h5>
            <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoThree)}>1.2.3 Trade Deadline</h5>
            <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoFour)}>1.2.4 Trade Restrictions</h5>
            <h5 class="noUnderscore clickable" on:click={() => goToSection(oneTwoFive)}>1.2.5 Veto/Trade Process</h5>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(oneThree)}>1.3 Waiver Wire</h4>
    
    <h3 class="noUnderscore clickable" on:click={() => goToSection(two)}>Section 2: Drafting</h3>
    
        <h4 class="noUnderscore clickable" on:click={() => goToSection(twoOne)}>2.1 Draft Order</h4>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(twoTwo)}>2.2 Rookie Drafts</h4>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(twoThree)}>2.3 Draft Day Trades</h4>
    
    <h3 class="noUnderscore clickable" on:click={() => goToSection(three)}>Section 3: Scoring System</h3>
    
        <h4 class="noUnderscore clickable" on:click={() => goToSection(threeOne)}>3.1 Voting on Scoring System</h4>
    
    <h3 class="noUnderscore clickable" on:click={() => goToSection(four)}>Section 4: Postseason</h3>
    
        <h4 class="noUnderscore clickable" on:click={() => goToSection(fourOne)}>4.1 Playoffs</h4>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(fourTwo)}>4.2 Playoff Tiebreakers</h4>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(five)}>Section 5: Tanking Policy</h3>
    
        <h4 class="noUnderscore clickable" on:click={() => goToSection(fiveOne)}>5.1 League Tanking Policy</h4>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(six)}>Section 6: Replacing Managers</h3>
    
        <h4 class="noUnderscore clickable" on:click={() => goToSection(sixOne)}>6.1 Removing Managers</h4>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(sixTwo)}>6.2 Replacing Managers</h4>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(sixThree)}>6.3 Replacement Incentive</h4>

    <h3 class="noUnderscore clickable" on:click={() => goToSection(seven)}>Section 7: League Finances</h3>
    
        <h4 class="noUnderscore clickable" on:click={() => goToSection(sevenOne)}>7.1 League Dues</h4>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(sixTwo)}>7.2 Payout</h4>
        <h4 class="noUnderscore clickable" on:click={() => goToSection(sixThree)}>7.3 Raising Dues</h4>
    
    
    <hr />
    
    <h2 class="sectionHeading" bind:this={one}>Section 1 Roster Breakdown</h2>
    
    <h3 class="subSectionHeading" bind:this={oneOne}>1.1 Positional Breakdown</h3>
    
    <p>28 Total Players</p>
    
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
        <li>SUPERFLEX (QB/RB/WR/TE</li>
    </ul>
    
    <p>10 Bench (Expanded by 5 between the competition committee and draft day during the off-season).</p>

    <p>3 IR Spots (Player must be labeled as IR, Out, or Covid in the Sleeper App)</p>
    
        <h4 bind:this={oneOneOne}>1.1.1 Position Maximums</h4>
        
        <div class="subBlock">
            <table class="positionMaximums">
                <tr><td>QB</td><td class="right">none</td></tr>
                <tr><td>RB</td><td class="right">none</td></tr>
                <tr><td>WR</td><td class="right">none</td></tr>
                <tr><td>TE</td><td class="right">none</td></tr>
            </table>
        </div>


    <h3 class="subSectionHeading" bind:this={oneTwo}>1.2 Trading</h3>
    
    <p>Tradable assets include players, draft picks, and FAAB dollars. Conditional trades are also permitted. For example, a manager may trade for a quarterback who is speculated to be benched. The condition could be as follows: Team A trades a quarterback to Team B for a first-round pick, with the condition that the quarterback starts for the rest of the season (barring injury). If the quarterback is benched, the draft pick is reduced to a second-round pick instead.

When a conditional trade takes place, the Commissioner must be notified, and a note will be added to the profiles of the players involved. It is the responsibility of the managers involved in the trade to monitor the conditions and inform the Commissioner if the terms are not met./p>

    <h4 bind:this={oneTwoOne}>1.2.1 Trade Collusion</h4>
    <div class="subBlock">
        <p>If any team managers are suspected of offering or accepting bribes to enhance their own team or another manager’s team via trade, trading assets other than fantasy players, draft picks, or FAAB dollars, or otherwise found guilty of any form of collusion*, all parties involved in the trade will be subject to disciplinary action. Punishments may include the following:</p>
        
        <ul>
            <li>First Offense – Immediate reduction of FAAB budget by 80%</li>
            <li>Second Offense – An immediate freeze on all transaction types—including trades and waiver wire bids—for the next 17 weeks of regular season and playoff fantasy football games. This equates to a one-year suspension from all trades and waiver wire activity.</li>
            <li>Third Offense – A league meeting of all members not involved in any of the improper trades/activity in question will take place to discuss next steps.</li>
        </ul>

        <p>All trades that are found guilty of collusion, will be reversed/denied. If the trade had affected the outcome of previous games, the results of those games will be revised.</p>

        <p>Collusion includes any coordinated efforts by managers to intentionally stack one team by trading players, draft picks, or FAAB dollars to create an unfair advantage over the rest of the league. The commissioners recognize that collusion does not necessarily occur through a single trade but may develop over a series of trades. Therefore, the commissioners will maintain a record of all trades between any two teams to monitor for potential collusion.</p>

        <p>The commissioner will err on the side of allowing team managers to manage their teams as they see fit. Any suspected collusion must be clear and convincing. However, the commissioner reserves the right to step in and, at a minimum, assess the rationale behind any heavily lopsided trade.</p>
    </div>

    <h4 bind:this={oneTwoTwo}>1.2.2 Lending Players Prohibition</h4>
    <div class="subBlock">
        <p>Any player traded may not be re-acquired via trade by the original team for at least six weeks following the initial trade. The only exception to this rule is during the offseason. However, for trades involving any player ranked in the top 35, re-acquisition by the original team is prohibited for two years after the trade, with no offseason exception. These players will be tagged with “NO TRADE BACK TO/FROM” to enforce this rule.</p>
    </div>
    
    <h4 bind:this={oneTwoThree}>1.2.3 Trade Deadline</h4>
    <div class="subBlock">
        <p>The trade deadline will be set for the Monday of week 7 after Monday night's game.</p>
    </div>
    
    <h4 bind:this={oneTwoFour}>1.2.4 Trade Restrictions</h4>
    <div class="subBlock">
        <p>You will not be able to trade draft picks that are more than 3 drafts away. For example, during the 2021 season you cannot trade any picks in or after the 2025 draft.</p>
    </div>
    
    <h4 bind:this={oneTwoFive}>1.2.5 Veto/Trade Process</h4>
    <div class="subBlock">
        <p>Only the Commissioner may veto trades. See Sections "1.2 Trading"<p/>
    </div>
       
    <h3 bind:this={oneThree}>1.3 Waiver Wire</h3>

    <p>Beginning in the 2023 season, the MFFL will award bonus FAAB (Free Agent Acquisition Budget) dollars to managers who attend and actively participate in the league’s Competition Committee meetings and the in-person draft. Out-of-town managers must follow along and participate live during the draft to qualify—auto-drafting is not allowed.</p>
    
    <p>FAAB Waiver Wire System: Each team will begin the season with a Free Agent Acquisition Budget (FAAB) between $100 and $200, with the exact amount announced by the Commissioner before the season starts. No $0 bids are allowed. Waiver bids will process every Thursday at 2:00 a.m.</p>

    <p>FAAB budgets carries over to the next season, to the maximum amount of $999</p>

    <h4 bind:this={oneTwoThree}>1.3.1 Waiver Wire/FAAB Collusion</h4>
    <div class="subBlock">
        <p>Collusion includes any coordinated efforts to manipulate the waiver wire or FAAB system for an unfair advantage. This includes, but is not limited to:
        <ul>
            <li>Pooling FAAB budgets between teams.</li>
            <li>Dropping a player with the intent of allowing a specific team to acquire them, particularly if it’s known that the team with the highest FAAB will likely pick up the player.</li>
    </div>
        <p>The Commissioner reserves the right to investigate any suspicious bidding or dropping patterns and to take disciplinary action if collusion is suspected. Punishments for FAAB/waiver wire collusion may include FAAB penalties, transaction freezes, or other sanctions as outlined in the league’s collusion policy.</p>
    
   <h2 class="sectionHeading" bind:this={four}>Section 2 Postseason</h2>
    
    <h3 bind:this={fourOne}>2.1 Playoffs</h3>
    <p>At the end of the season 8 teams will make the playoffs. The first round of playoffs will commence in week 15. Each team that wins their division, North, South, East & West (4) and the 4 wild card teams that finish with the best records overall from the remaining teams, will receive a playoff berth. Each playoff matchup will only last one week and the winner will advance. Week 18 will not be used.</p>
    <p>The seed determination is as follows:<p/>
            <p>1. Overall record.<p/>
            <p>2. Points for.<p/>
            <p>3. Poins Against.<p/>
            <p>4. Coin flip. In extream cases.<p/>
    <p>The first-round matchups will be determined by end-of-season seeding | 1-vs-8 | 2-vs-7 | 3-vs-6 | 4-vs-5 |. In the following rounds, each team stays on their side of the bracket as they advance.<p/>
    <style>
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
    

    <h2 class="sectionHeading" bind:this={two}>Section 3 Drafting</h2>
    
    <h3 bind:this={twoTwo}>3.1 Drafts</h3>
    <p>The draft will consist of rookies only and will take place over 5 rounds, with a 5-minute limit per pick. To accommodate incoming players, bench sizes will temporarily expand by five spots at the start of the season, following the Competition Committee meeting. These additional spots will be removed shortly after the draft, at which point all teams must reduce their rosters to comply with standard roster limits.</p>
    <p>Any spots not filled during the draft, can be filled immediately afterwards from the waiver wire.</p>

    <h3 bind:this={twoOne}>3.2 Draft Order</h3>
    <p>The draft order each year will be a linear.</p>
    <script>
      // No additional JavaScript needed if you're just displaying the table
    </script>

    <style>
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
    </style>

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

    <h3 bind:this={twoThree}>3.3 Draft Day Trades</h3>
    <p>If a trade is being negotiated during the draft, either party may request that the Commissioner pause the draft to allow additional time for the trade discussions.</p>

    <h3 bind:this={twoThree}>3.4 Draft Order Determiniation</h3>
    <p>The playoffs will determine the draft order for the following year as follows:</p>
    <script>
      // No additional JavaScript needed if you're just displaying the table
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
    </style>
    <div class="subBlock">
      <table class="draft-order-table">
        <thead>
          <tr class="table-header">
            <th>Seed</th>
            <th>Pick</th>
          </tr>
        </thead>
        <tbody>
          <tr class="playoffs">
            <td colspan="2">PLAYOFFS</td>
          </tr>
          <tr>
            <td>1st</td>
            <td>16th Draft Pick</td>
          </tr>
          <tr>
            <td>2nd</td>
            <td>15th Draft Pick</td>
          </tr>
          <tr>
            <td>3rd</td>
            <td>14th Draft Pick</td>
          </tr>
          <tr>
            <td>4th</td>
            <td>13th Draft Pick</td>
          </tr>
          <tr>
            <td>5th</td>
            <td>12th Draft Pick</td>
          </tr>
          <tr>
            <td>6th</td>
            <td>11th Draft Pick</td>
          </tr>
          <tr>
            <td>7th</td>
            <td>10th Draft Pick</td>
          </tr>
          <tr>
            <td>8th</td>
            <td>9th Draft Pick</td>
          </tr>
          <tr class="consolation">
            <td colspan="2">TOILET BOWL</td>
          </tr>
          <tr class="no-border">
            <td>9th</td>
            <td>1st Draft Pick *TBD</td>
          </tr>
            <tr class="no-border">
            <td>10th</td>
            <td>2nd Draft Pick *TBD</td>
          </tr>
          <tr>
            <td>11th</td>
            <td>3rd Draft Pick *TBD</td>
          </tr>
          <tr class="no-border">
            <td>12th</td>
            <td>4th Draft Pick *TBD</td>
          </tr>
          <tr class="no-border">
            <td>13th</td>
            <td>5th Draft Pick *TBD</td>
          </tr>
          <tr>
            <td>14th</td>
            <td>6th Draft Pick *TBD</td>
          </tr>
          <tr class="no-border">
            <td>15th</td>
            <td>7th Draft Pick *TBD</td>
          </tr>
          <tr>
            <td>16th</td>
            <td>8th Draft Pick *TBD</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>*TBD - The exact draft order will be determined using a lottery-style drawing with a ping pong machine. Each pick will be drawn randomly to ensure fairness.<p/>

    <h2 class="sectionHeading" bind:this={three}>Section 4 Scoring System</h2>

    <h3 bind:this={threeOne}>4.1 Scoring System</h3>
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
            <input type="text" value="0.1">
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
            <input type="text" vlaue="0">
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
    
    <h3 bind:this={sixTwo}>6.2 Replacing Managers</h3>
    <p>When a manager is replaced, the commissioners will try to find a suitable candidate with some connection to at least a portion of the existing managers. A list of potential candidates is maintained by the commissioner. If you know of someone interested in joining, please provide their name to the commissioner. Priority will be given to managers who are eager to commit to a dynasty league and will be highly active within the league.</p>
    
    <h3 bind:this={sixThree}>6.3 Quitting and Replacement  of Incentive Managers</h3>
    <p>In the event that a manager chooses to quit the league, the following conditions must be met:</p>
    <p>1. A reigning champion CANNOT leave the league; they must return to defend or lose their championship!<p/>
    <p>2. If future draft picks are traded, a manager CANNOT leave their team. If you plan on quitting, please keep this in mind.<p/>
    <p>3. Once you leave the MFFL, you can NEVER return. Keep in mind that if you quit or are removed from the league, you will not be invited back.<p/>

    <p>To support the incoming manager, their team will immediately qualify for the #1 draft lottery. Additionally, a bonus may be added to their FAAB for the initial season.<p/>

    <h2 class="sectionHeading" bind:this={seven}>Section 7 League Finances</h2>
    
    <h3 bind:this={sevenOne}>7.1 League Dues</h3>
    <p>League dues are set at ${dues} and are collected by the commissioner. All managers must be fully paid by no later than Week 6 of the season.</p>
    
    <h3 bind:this={sevenTwo}>7.2 Payout</h3>
    <p>League payout is structured as follows:</p>
    <ul>
        <li>1st place: $1000</li>
        <li>2nd place: $75</li>
    </ul>
    
    <h3 bind:this={sevenThree}>7.3 Raising Dues</h3>
    <p>A ⅔ majority vote is required in order to raise league dues. In the event that a manager is no longer financially comfortable with the buyin, finding a co-manager to split the cost is reccomended.</p>

</div>
