<script>
  // src/routes/playoffs-projection/+page.svelte
  export let data;

  // The server loader returns: { projections, error }
  const rows = Array.isArray(data?.projections) ? data.projections : [];
  const err = data?.error || '';

  const AVATAR_BASE = '/playoffs-projection/avatars';

  // Helpers
  function initials(name = '') {
    return String(name)
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // Fallback handlers: PNG -> JPG -> Initials
  function onPngError(e) {
    const png = e.currentTarget;
    const jpg = png.nextElementSibling;         // the JPG <img>
    png.style.display = 'none';
    if (jpg) jpg.style.display = 'block';
  }
  function onJpgError(e) {
    const jpg = e.currentTarget;
    const init = jpg.nextElementSibling;        // the <span> initials
    jpg.style.display = 'none';
    if (init) init.style.display = 'flex';
  }
</script>

<style>
  .page {
    min-height: 100vh;
    background: radial-gradient(circle at 20% 20%, #0b0b0b 0%, #000 100%);
    color: #fff;
    padding: 2rem 1.25rem;
  }
  h1 {
    margin: 0 0 1rem 0;
    font-size: 1.9rem;
    font-weight: 800;
    letter-spacing: .2px;
  }
  .error {
    background: #2a1111;
    border: 1px solid #5c1b1b;
    color: #ffb3b3;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    overflow: hidden;
  }
  th, td {
    padding: 0.7rem 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    text-align: left;
    font-size: 0.95rem;
  }
  th {
    background: rgba(255,255,255,0.04);
    font-weight: 700;
  }
  tbody tr:hover {
    background: rgba(0,186,255,0.08);
  }

  .teamcell {
    display: flex;
    align-items: center;
    gap: .75rem;
  }

  /* Avatar styles to match dark theme */
  .avatar {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #222;
    overflow: hidden;
    flex: 0 0 40px;
    background: radial-gradient(circle at 40% 40%, #1e1e1e 0%, #000 100%);
    box-shadow:
      0 0 14px rgba(0, 186, 255, 0.20),
      inset 0 0 8px rgba(0, 186, 255, 0.08);
  }
  .avatar img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .avatar img + img { display: none; } /* JPG hidden until PNG fails */
  .avatar .init {
    display: none;               /* shown if both images fail */
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: .9rem;
    color: #fff;
  }

  a.teamlink {
    color: #00baff;
    text-decoration: none;
    border-bottom: 1px solid rgba(0,186,255,0.35);
    padding-bottom: 1px;
  }
  .muted { opacity: 0.65; }
</style>

<div class="page">
  <h1>Playoff Projections</h1>

  {#if err}
    <div class="error">Error loading projections: {err}</div>
  {/if}

  {#if rows.length === 0}
    <div class="muted">No projections found.</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>Division</th>
          <th>Record</th>
          <th>Points</th>
          <th>Chances</th>
          <th>Targets</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row}
          <tr>
            <td>
              <div class="teamcell">
                <div class="avatar" title={row.teamName}>
                  {#if row.slug}
                    <img
                      alt={row.teamName}
                      src={`${AVATAR_BASE}/${row.slug}.png`}
                      on:error={onPngError}
                    />
                    <img
                      alt=""
                      src={`${AVATAR_BASE}/${row.slug}.jpg`}
                      on:error={onJpgError}
                    />
                    <span class="init">{initials(row.teamName)}</span>
                  {:else}
                    <span class="init" style="display:flex">{initials(row.teamName)}</span>
                  {/if}
                </div>

                {#if row.slug}
                  <!-- Guarded link: only when slug is truthy -->
                  <a class="teamlink" href={`/playoffs-projection/${row.slug}`}>{row.teamName}</a>
                {:else}
                  <span class="muted">{row.teamName}</span>
                {/if}
              </div>
            </td>

            <td>{row.division}</td>
            <td>{row.wins}-{row.losses}-{row.ties}</td>
            <td>{row.points}</td>
            <td>{row.divStatus} {row.playStatus}</td>
            <td>{row.targets}{row.min ? ` (min ${row.min})` : ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
