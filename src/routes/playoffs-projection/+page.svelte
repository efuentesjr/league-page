<script>
  // Data from +page.server.js (R2 fetch)
  export let data;

  const {
    projections = [],
    error = null,
    lastModified = null,
    fetchedAt = null,
    sourceUrl = null
  } = data ?? {};

  import { managers } from '$lib/utils/leagueInfo';
  import SleeperAvatar from '$lib/components/SleeperAvatar.svelte';

  // ---------- helpers ----------
  const s = (v) => (typeof v === 'string' ? v.trim() : '');
  const prettifySlug = (str = '') =>
    str.replace(/-/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());

  // Build quick lookup by slug
  const bySlug = new Map((Array.isArray(managers) ? managers : []).map((m) => [m.slug, m]));

  // Label (prefer configured teamName, else prettified slug)
  const labelFor = (slug) => {
    const m = bySlug.get(slug);
    return s(m?.teamName ?? m?.team_name) || prettifySlug(slug);
  };

  // Parse "C:41.8% T:17.2%" -> { c: 41.8, t: 17.2 }
  function parsePlayStatus(sv) {
    if (!sv) return { c: -Infinity, t: -Infinity };
    const c = Number((sv.match(/C:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    const t = Number((sv.match(/T:\s*([\d.]+)%/i) || [])[1] ?? -Infinity);
    return { c, t };
  }

  function humanTime(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); }
    catch { return iso; }
  }

  // ---------- build + sort rows ----------
  let rows = [];
  $: rows = (projections || [])
    .filter((p) => p?.slug)
    .map((p) => ({
      slug: p.slug,
      division: p.division ?? '',
      wins: p.wins ?? 0,
      losses: p.losses ?? 0,
      ties: p.ties ?? 0,
      points: p.points ?? 0,
      divStatus: p.divStatus ?? '',
      playStatus: p.playStatus ?? '',
      min: p.min ?? '',
      targets: p.targets ?? '',
      gIn: p.gIn ?? '',
      divTgts: p.divTgts ?? ''
    }))
    // --------- sort by record (wins → losses → ties → points) ---------
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;        // more wins first
      if (a.losses !== b.losses) return a.losses - b.losses; // fewer losses next
      if (b.ties !== a.ties) return b.ties - a.ties;        // then more ties
      return (b.points ?? 0) - (a.points ?? 0);             // finally by points desc
    });
</script>

<div class="wrap">
  <h2 class="title">Playoffs AI Analysis</h2>

  {#if lastModified || fetchedAt}
  <div class="meta">
    <span class="updated">Updated: {humanTime(lastModified || fetchedAt)}</span>
  </div>
  {/if}

  <div class="overlay">
    {#if error}
      <p class="text-red-500">Error loading projections: {error}</p>
    {/if}

    {#if rows.length === 0}
      <p class="text-center text-sm text-gray-300">No projections found.</p>
    {:else}
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
                <a class="teamlink" href={`/playoffs-projection/${r.slug}`}>
                  <SleeperAvatar slug={r.slug} size={24} alt={labelFor(r.slug)} />
                  <span class="name">{labelFor(r.slug)}</span>
                </a>
              </td>
              <td>{r.wins}-{r.losses}{#if r.ties && r.ties > 0}-{r.ties}{/if}</td>
              <td>{r.points ?? 0}</td>
              <td>{r.divStatus ?? ''}</td>
              <td>{r.playStatus ?? ''}</td>
              <td>{r.min ?? ''}</td>
              <td>{r.targets ?? ''}</td>
              <td>{r.gIn ?? ''}</td>
              <td>{r.divTgts ?? ''}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
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
  margin: 0 0 0.25rem;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
}
.meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: .8rem;
  color: #aaa;
  margin-bottom: .5rem;
}
.meta a { color: #6fb4ff; text-decoration: none; }
.meta a:hover { text-decoration: underline; }
.meta .dot { opacity: .6; }

.overlay {
  width: min(97%, 920px);
  margin: 0 auto;
  max-height: 70vh;
  overflow: auto;
  padding: 0.5rem;
  background: rgba(0,0,0,0.35);
  border-radius: 8px;
}
.overlay table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  line-height: 1.1rem;
}
.overlay th, .overlay td {
  padding: 4px 6px;
  text-align: center;
  white-space: nowrap;
}
.overlay th {
  background: rgba(0,0,0,0.55);
  color: white;
  position: sticky;
  top: 0;
  z-index: 1;
}
.overlay td {
  color: white;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
.overlay td:first-child,
.overlay td:nth-child(2) {
  text-align: left;
}
.teamcell { display:flex; align-items:center; gap: 8px; }

.teamlink {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #6fb4ff;
  font-weight: 600;
}
.teamlink:hover { text-decoration: underline; }

.name { line-height: 1; }
</style>
