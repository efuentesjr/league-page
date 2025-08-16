<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium2.jpg" alt="Stadium2" />
  <h2 class="title">Playoffs AI Analysis</h2>

  <!-- Table overlay -->
  <div class="overlay">
    <table>
      <thead>
        <tr>
          <th>Dv</th>
          <th>Team</th>
          <th>W-L-T</th>
          <th>Pts</th>
          <th>DivSTATUS</th>
          <th>PlaySTATUS</th>
          <th>mIn</th>
          <th>Targets</th>
          <th>gIn</th>
          <th>DivTgts</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>N</td><td><a href="#">Brute Force</a></td><td>0-0-0</td><td>0</td><td>C:24.7%</td><td>C:41.8% T:17.2%</td><td>5</td><td>8.0-8.0</td><td>10</td><td>9.0-11.0</td></tr>
        <tr><td>N</td><td><a href="#">Comeback Kid</a></td><td>0-0-0</td><td>0</td><td>C:24.8%</td><td>C:41.7% T:17.4%</td><td>5</td><td>8.0-8.0</td><td>10</td><td>9.0-11.0</td></tr>
        <tr><td>E</td><td><a href="#">Muad'Dib 🎗</a></td><td>0-0-0</td><td>0</td><td>C:24.8%</td><td>C:41.7% T:17.2%</td><td>5</td><td>8.0-8.0</td><td>11</td><td>9.0-11.0</td></tr>
        <!-- ... continue rows ... -->
      </tbody>
    </table>
  </div>

  <!-- Legend block OUTSIDE overlay -->
  <div class="legend">
    <p><strong>LEGEND:</strong></p>
    <p>Status C = Clinch %</p>
    <p>T = % that will end up in a tiebreak not resolved yet</p>
    <p>mIn = Wins needed for any chance</p>
    <p>Target = Projected Wins needed</p>
    <p>gIn = Wins that should guarantee a spot (if any then Controls Own Destiny)</p>
    <p class="small-note">
      Due to many remaining games the analysis incorporated some randomization methods. 
      The accuracy of status, odds, targets, and paths will depend on the depth of analysis 
      as well as the number of remaining games.
    </p>
  </div>
</div>

<style>
.image-wrapper {
  position: relative;
  max-width: 900px;
  margin: 0.5rem auto;
}
.image-wrapper img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.title {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.25rem 0.5rem;
  font-weight: 900;
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  color: white;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.9);
  white-space: nowrap;
}
.overlay {
  position: absolute;
  top: 55px;   /* lower to sit under the title */
  left: 50%;
  transform: translateX(-50%);
  width: min(97%, 880px);
  max-height: 55%;
  overflow: auto;
  background: rgba(0,0,0,0.45);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
}
.overlay table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  line-height: 1rem;
}
.overlay th, .overlay td {
  padding: 2px 4px;
  white-space: nowrap;
  text-align: center;
}
.overlay th {
  background: rgba(0,0,0,0.6);
  color: #fff;
}
.overlay td {
  color: #eee;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
.overlay a {
  color: #4da6ff;
  font-weight: 800;
  text-decoration: none;
}
.overlay a:hover { text-decoration: underline; }

/* Legend styling */
.legend {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  color: #fff;
  font-size: 0.7rem;
  text-align: left;
  line-height: 1rem;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
}
.legend .small-note {
  margin-top: 0.25rem;
  font-size: 0.65rem;
}
</style>
