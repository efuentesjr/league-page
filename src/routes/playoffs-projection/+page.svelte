<script>
  // R2 data injected by +page.server.js (already avoids CORS)
  export let data;
  const { projections, error } = data;

  // Live team identity (name + avatar) from the same pipeline as Standings
  import { TeamLabel } from '$lib/components';

  // Parse "C:41.8% T:17.2%" -> { c: 41.8, t: 17.2 }
  function parsePlayStatus(s) {
    if (!s) return { c: -Infinity, t: -Infinity };
    const c = Number((s.match(/C:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    const t = Number((s.match(/T:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    return { c, t };
  }

  let rows = [];

  function buildRows() {
    rows = (projections || [])
      .filter((p) => p?.slug)
      .map((p) => ({
        slug: p.slug,
        division: p.division ?? "",
        wins: p.wins ?? 0,
        losses: p.losses ?? 0,
        ties: p.ties ?? 0,
        points: p.points ?? 0,
        divStatus: p.divStatus ?? "",
        playStatus: p.playStatus ?? "",
        min: p.min ?? "",
        targets: p.targets ?? "",
        gIn: p.gIn ?? "",
        divTgts: p.divTgts ?? ""
      }));

    // Sort by PlaySTATUS: first by C% desc, then by T% desc
    rows.sort((a, b) => {
      const A = parsePlayStatus(a.playStatus);
      const B = parsePlayStatus(b.playStatus);
      if (B.c !== A.c) return B.c - A.c;
      if (B.t !== A.t) return B.t - A.t;
      // stable fallback
      return (a.slug || "").localeCompare(b.slug || "");
    });
  }

  buildRows();
</script>

<div class="wrap">
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
        {#each rows as r (r.slug)}
          <tr>
            <td>{r.division}</td>
            <td class="teamcell">
              <!-- Live name + avatar (piggy-backs Sleeper like Standings) -->
              <TeamLabel slug={r.slug} href={`/team/${r.slug}`} />
            </td>
            <td>{r.wins}-{r.losses}{#if r.ties && r.ties > 0}-{r.ties}{/if}</td>
            <td>{r.points ?? 0}</td>
            <td>{r.divStatus ?? ""}</td>
            <td>{r.playStatus ?? ""}</td>
            <td>{r.min ?? ""}</td>
            <td>{r.targets ?? ""}</td>
            <td>{r.gIn ?? ""}</td>
            <td>{r.divTgts ?? ""}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
.wrap {
  position: relative;
  max-width: 980px;
  margin: 1rem auto;
  background: #111;
  padding: 1rem 0 2rem;
  border-radius: 10px;
}
.title {
  text-align: center;
  font-weight: 800;
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  color: #fff;
  margin: 0 0 0.5rem;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
}
.overlay {
  width: min(97%, 920px);
  margin: 0 auto;
  max-height: 70vh;
  overflow: auto;
  padding: 0.5rem;
  background: rgba(0,0,0,0.35);
  border-radius: 8px;
}
.overlay table { width: 100%; border-collapse: collapse; font-size: 0.8rem; line-height: 1.1rem; }
.overlay th, .overlay td { padding: 4px 6px; text-align: center; white-space: nowrap; }
.overlay th { background: rgba(0,0,0,0.55); color: white; position: sticky; top: 0; z-index: 1; }
.overlay td { color: white; border-bottom: 1px solid rgba(255,255,255,0.12); }
.overlay td:first-child, .overlay td:nth-child(2) { text-align: left; }
.teamcell { display: flex; align-items: center; }
</style>
