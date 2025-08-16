<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium2.jpg" alt="Stadium2" />
  <h2 class="title">Playoff Computer Analysis MFFL</h2>

  <!-- Overlay for table only -->
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
        <!-- rest of your rows ... -->
      </tbody>
    </table>
  </div>

  <!-- Separate overlay legend -->
  <div class="legend-overlay">
    <strong>LEGEND:</strong><br />
    Status C = Clinch %<br />
    T = % that will end up in a tiebreak not resolved yet<br />
    mIn = Wins needed for any chance<br />
    Target = Projected Wins needed<br />
    gIn = Wins that should guarantee a spot (if any then Controls Own Destiny)<br /><br />
    <em>
      Due to many remaining games the analysis incorporated some randomization methods. 
      The accuracy of status, odds, targets, and 'paths' will depend on the depth of analysis 
      as well as the number of remaining games.
    </em>
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
  border-radius: 8px;
}

/* Title */
.title {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  margin: 0;
  color: black;
}

/* Table overlay */
.overlay {
  position: absolute;
  top: 40%;   /* sits mid-image */
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(97%, 880px);
  max-height: 50%;
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
.overlay th, .overlay td {
  padding: 2px 4px;
  text-align: center;
  white-space: nowrap;
}
.overlay th {
  background: rgba(0,0,0,0.6);
  color: white;
}
.overlay td {
  color: white;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
.overlay td:first-child,
.overlay td:nth-child(2) { text-align: left; }
.overlay a { color: #4da6ff; font-weight: bold; text-decoration: none; }
.overlay a:hover { text-decoration: underline; }

/* Legend overlay: separate, plain white text */
.legend-overlay {
  position: absolute;
  bottom: 10px;       /* pinned near bottom of image */
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  font-size: 0.7rem;
  line-height: 1rem;
  color: white;
  text-align: left;
}
.legend-overlay strong { color: #ffd966; }
.legend-overlay em { color: #ddd; font-size: 0.65rem; }
</style>
