<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium2.jpg" alt="Stadium2" />
  <h2 class="title">Playoffs AI Analysis</h2>

  <!-- TABLE overlay (scrolls independently) -->
  <div class="table-overlay">
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
        <!-- your rows as before -->
      </tbody>
    </table>
  </div>

  <!-- LEGEND overlay (separate; does NOT scroll with table) -->
  <div class="legend-overlay">
    <div class="legend-title">LEGEND</div>
    <ul class="legend-list">
      <li><b>Status C</b> = Clinch %</li>
      <li><b>T</b> = % likely to end in an unresolved tiebreak</li>
      <li><b>mIn</b> = Wins needed for any chance</li>
      <li><b>Target</b> = Projected wins needed</li>
      <li><b>gIn</b> = Wins that should guarantee a spot (controls destiny)</li>
    </ul>
    <div class="legend-note">
      Due to many remaining games, the analysis uses some randomization.
      Accuracy of status, odds, targets, and paths depends on analysis depth and
      number of remaining games.
    </div>
  </div>
</div>

<style>
/* Frame: stable height so overlays don’t jump */
.image-wrapper{
  position:relative;
  max-width:900px;
  margin:.5rem auto;
  height:clamp(320px, 58vw, 600px);
  border-radius:8px;
  overflow:hidden;
}
.image-wrapper img{
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
}

/* Title */
.title{
  position:absolute; top:10px; left:50%; transform:translateX(-50%);
  margin:0; color:#fff; text-shadow:0 2px 6px rgba(0,0,0,.8);
  font-weight:900; white-space:nowrap;
  font-size:clamp(1.4rem, 3.4vw, 2.2rem); z-index:2;
}

/* Table overlay (centered; scrolls) */
.table-overlay{
  position:absolute; left:50%; top:42%; transform:translate(-50%, -50%);
  width:min(97%, 880px);
  /* Reserve space for legend so they never overlap */
  max-height:calc(100% - 130px);
  overflow:auto; padding:.25rem .5rem;
  background:rgba(0,0,0,.45); border-radius:6px;
  box-shadow:0 3px 12px rgba(0,0,0,.25); z-index:2;
  -webkit-overflow-scrolling:touch;
}

/* Table */
.table-overlay table{ width:100%; border-collapse:collapse; color:#fff;
  font-size:.72rem; line-height:.96rem; }
.table-overlay th,.table-overlay td{
  padding:2px 4px; white-space:nowrap; text-align:center;
  border-bottom:1px solid rgba(255,255,255,.12);
}
/* Sticky header for mobile scrolling */
.table-overlay thead th{
  position:sticky; top:0; z-index:1;
  background:rgba(0,0,0,.7);
  backdrop-filter:saturate(110%) blur(0.5px);
  font-weight:800;
}
.table-overlay td:first-child,
.table-overlay td:nth-child(2){ text-align:left; }
.table-overlay a{ color:#4da6ff; font-weight:800; text-decoration:none; }
.table-overlay a:hover{ text-decoration:underline; }

/* Legend overlay (separate; no background; plain white) */
.legend-overlay{
  position:absolute; left:50%; bottom:10px; transform:translateX(-50%);
  width:min(95%, 880px); color:#fff; z-index:2;
  text-align:left; pointer-events:none; /* never steals scroll */
  text-shadow:0 1px 3px rgba(0,0,0,.6);
}
.legend-title{
  font-weight:800; letter-spacing:.04em; margin-bottom:.15rem;
}
.legend-list{
  margin:0; padding-left:1rem; list-style:disc;
  font-size:.68rem; line-height:.95rem;
}
.legend-list b{ font-weight:800; }
.legend-note{
  margin-top:.25rem; font-size:.62rem; line-height:.9rem; opacity:.95;
}

/* Mobile tweaks */
@media (max-width:480px){
  .image-wrapper{ height:clamp(320px, 66vw, 560px); }
  .table-overlay{ top:43%; max-height:calc(100% - 140px); }
  .table-overlay table{ font-size:.66rem; line-height:.9rem; }
  .table-overlay th,.table-overlay td{ padding:1px 3px; }
  .legend-list{ font-size:.62rem; line-height:.9rem; }
  .legend-note{ font-size:.58rem; line-height:.85rem; }
}
</style>

