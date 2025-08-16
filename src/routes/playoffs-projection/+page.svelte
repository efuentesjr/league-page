<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium2.jpg" alt="Stadium2" />
  <h2 class="title">Playoffs AI Analysis</h2>

  <!-- Centered overlayed table -->
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
        <tr><td>S</td><td><a href="#">SlickBears 🎗</a></td><td>0-0-0</td><td>0</td><td>C:25.2%</td><td>C:42.1% T:17.0%</td><td>5</td><td>8.0-8.0</td><td>9</td><td>9.0-11.0</td></tr>
        <!-- keep rest of teams ... -->
      </tbody>
    </table>
  </div>

  <!-- Legend section -->
  <div class="legend">
    <p><strong>LEGEND:</strong></p>
    <p>Status C = Clinch %</p>
    <p>T = % that will end up in a tiebreak not resolved yet</p>
    <p>mIn = Wins needed for any chance</p>
    <p>Target = Projected Wins needed</p>
    <p>gIn = Wins that should guarantee a spot (if any then Controls Own Destiny)</p>
    <p>Due to many remaining games the analysis incorporated some randomization methods. The accuracy of status, odds, targets, and 'paths' will depend on the depth of analysis as well as the number of remaining games.</p>
  </div>
</div>

<style>
/* Wrapper + banner */
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

/* Title */
.image-wrapper .title {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  color: white;
  font-weight: 900;
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  text-shadow: 0 2px 4px rgba(0,0,0,0.7);
}

/* Table overlay */
.overlay {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  max-height: 45%;
  overflow: auto;
  padding: 0.25rem 0.5rem;
  background: rgba(0,0,0,0.45);
  border-radius: 6px;
}
.overlay table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  line-height: 1rem;
}
.overlay th,
.overlay td {
  padding: 2px 4px;
  white-space: nowrap;
  text-align: center;
}
.overlay th {
  font-weight: 800;
  color: #fff;
  background: rgba(0,0,0,0.6);
}
.overlay td {
  color: #eee;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
.overlay td:first-child,
.overlay td:nth-child(2) { text-align: left; }

/* Links */
.overlay a {
  color: #4da6ff;
  text-decoration: none;
  font-weight: 800;
}
.overlay a:hover { text-decoration: underline; }

/* Legend styling */
.legend {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  color: white;
  font-size: 0.75rem;
  line-height: 1.2rem;
  text-align: left;
  background: none;
}
.legend strong {
  font-weight: 900;
  text-decoration: underline;
}

/* Phone tweaks */
@media (max-width: 480px) {
  .overlay { width: 96%; font-size: 0.7rem; }
  .legend { font-size: 0.7rem; }
}
</style>
