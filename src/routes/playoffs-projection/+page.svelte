<script>
  import { onMount } from "svelte";
  export let data;
  const { projections, sourceUrl, error } = data;

  // Sort by division (N, E, W, S) then by DivSTATUS (high → low)
  onMount(() => {
    const tbody = document.querySelector(".overlay table tbody");
    if (!tbody) return;

    const dvOrder = ["N", "E", "W", "S"];
    const rows = Array.from(tbody.querySelectorAll("tr"));

    const getDivStatus = (text) => {
      const match = text.match(/:\s*([\d.]+)%/);
      return match ? parseFloat(match[1]) : -Infinity;
    };

    rows.sort((a, b) => {
      const dvA = a.cells[0].textContent.trim();
      const dvB = b.cells[0].textContent.trim();
      const dvCmp = dvOrder.indexOf(dvA) - dvOrder.indexOf(dvB);
      if (dvCmp !== 0) return dvCmp;

      const dsA = getDivStatus(a.cells[4].textContent);
      const dsB = getDivStatus(b.cells[4].textContent);
      return dsB - dsA;
    });

    rows.forEach((r) => tbody.appendChild(r));
  });
</script>

<div class="image-wrapper">
  <img src="" alt="Stadium2" />
  <h2 class="title">Playoffs AI Analysis</h2>

  <div class="overlay">
    {#if error}
      <p class="text-red-500">Error loading projections: {error}</p>
    {/if}

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
        {#each projections as t (t.teamId || t.teamName)}
          <tr>
            <td>{t.division}</td>
            <td>
              <a href={`/team/${t.teamId}`}>{t.teamName}</a>
            </td>
            <td>{t.wins}-{t.losses}{#if t.ties && t.ties>0}-{t.ties}{/if}</td>
            <td>{t.points ?? 0}</td>
            <td>{t.divStatus ?? ""}</td>
            <td>{t.playStatus ?? ""}</td>
            <td>{t.min ?? ""}</td>
            <td>{t.targets ?? ""}</td>
            <td>{t.gIn ?? ""}</td>
            <td>{t.divTgts ?? ""}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="legend">
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
.title {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  margin: 0;
  white-space: nowrap;
  color: white;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
}
.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(97%, 880px);
  max-height: 70%;
  overflow: auto;
  padding: 0.25rem 0.5rem;
  background: rgba(0,0,0,0.4);
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
.legend {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  line-height: 1rem;
  color: white;
  text-align: left;
}
.legend strong { color: #ffd966; }
.legend em { color: #ddd; font-size: 0.65rem; }
</style>
