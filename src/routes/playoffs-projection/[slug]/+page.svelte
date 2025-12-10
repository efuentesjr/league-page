<script>
  export let data;
  const { slug, team, avatarBasePath } = data;

  // Avatar candidates (PNG then JPG)
  const candidates = [
    `${avatarBasePath}/${slug}.png`,
    `${avatarBasePath}/${slug}.jpg`
  ];
  let avatarUrl = candidates[0];
  let tried = 0;

  function handleError() {
    tried++;
    if (tried < candidates.length) {
      avatarUrl = candidates[tried];
    } else {
      avatarUrl = ''; // fallback to initials
    }
  }

  const initials = team.team
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Helpers for percentages
  function pctNumber(x) {
    if (x == null) return 0;
    const s = String(x).trim().toLowerCase();

    // Text statuses
    if (s.includes('clinched')) return 100;
    if (s.includes('eliminated')) return 0;

    const n = Number(s.replace('%', '').trim());
    return isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  }

  const odds = [
    { label: 'Division', value: pctNumber(team.status?.division) },
    { label: 'Playoffs', value: pctNumber(team.status?.playoffs) },
    // Your working code uses "tie" here, so we keep it
    { label: 'Tie', value: pctNumber(team.status?.tie) }
  ];

  // ---------------- Elimination / Clinch badges ----------------
  function isEliminated(val) {
    return typeof val === 'string' && val.trim().toLowerCase() === 'eliminated';
  }

  // Treat anything containing "clinched" as clinched
  function isClinched(val) {
    if (typeof val !== 'string') return false;
    return val.trim().toLowerCase().includes('clinched');
  }

  // Only treat values that explicitly mention "elim" as possible elimination
  function isPossibleElim(val) {
    if (typeof val !== 'string') return false;
    const v = val.trim().toLowerCase();
    if (!v.includes('elim')) return false;
    return v.startsWith('possible elim') || v.startsWith('poss. elim');
  }

  const divElim = isEliminated(team.status?.division);
  const poElim = isEliminated(team.status?.playoffs);
  const poPoss = isPossibleElim(team.status?.playoffs);
  const divClinched = isClinched(team.status?.division);
  const poClinched = isClinched(team.status?.playoffs);

  // ---------------- Paths to Clinch (inline; no new component) ----------------

  // Make a stable key from the current page team name
  function keyFor(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('blue tent')) return 'bluetent';
    if (n.includes('baller')) return 'blueballers';
    if (n.includes('prime')) return 'primetime';
    if (n.includes('timeshift')) return 'texastimeshifts';
    return n;
  }

  // Split one OR-path into chips (we show chips for each *AND* condition)
  function chipsFrom(line) {
    return String(line)
      .split(/\*AND\*/i)
      .map((s) => s.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .map((chunk) => {
        const m = chunk.match(/(.+?)\s+(WINS|LOSES)$/i);
        return m
          ? { team: m[1].trim(), outcome: m[2].toUpperCase() }
          : { team: chunk, outcome: '' };
      });
  }

  // ---- Paths-to-Playoffs data (YOUR NEW INFO) ----

  // Blue Tent All-S can do no worse than end up tied for a spot if:
  // 1) WINS *AND* bLuE BaLLeRs LOSES *AND* TexasTimeshifts LOSES


  // bLuE BaLLeRs clinches a playoff spot:
  // 1) WINS *AND* PrimeTime Prodi LOSES, OR;
  // 2) WINS *AND* TexasTimeshifts LOSES
  // bLuE BaLLeRs can do no worse than end up tied for a spot if:
  // 1) WINS, OR;
  // 2) TexasTimeshifts LOSES


  // PrimeTime Prodi clinches a playoff spot:
  // 1) bLuE BaLLeRs LOSES, OR;
  // 2) WINS, OR;
  // 3) TexasTimeshifts LOSES


  // TexasTimeshifts clinches a playoff spot:
  // 1) WINS *AND* bLuE BaLLeRs LOSES, OR;
  // 2) WINS *AND* PrimeTime Prodi LOSES
  // TexasTimeshifts can do no worse than end up tied for a spot if:
  // 1) bLuE BaLLeRs LOSES, OR;
  // 2) WINS


  // Choose lists for the active team tab
  const k = keyFor(team.team);

  const divisionPaths =
    k === 'bluetent'
      ? paths_bluetent.division
      : k === 'blueballers'
      ? paths_blueballers.division
      : k === 'primetime'
      ? paths_primetime.division
      : k === 'texastimeshifts'
      ? paths_texastimeshifts.division
      : [];

  const playoffPaths =
    k === 'bluetent'
      ? paths_bluetent.playoffs
      : k === 'blueballers'
      ? paths_blueballers.playoffs
      : k === 'primetime'
      ? paths_primetime.playoffs
      : k === 'texastimeshifts'
      ? paths_texastimeshifts.playoffs
      : [];

  const tieOnlyPaths =
    k === 'bluetent'
      ? paths_bluetent.tieonly
      : k === 'blueballers'
      ? paths_blueballers.tieonly
      : k === 'primetime'
      ? paths_primetime.tieonly
      : k === 'texastimeshifts'
      ? paths_texastimeshifts.tieonly
      : [];
</script>

<style>
  .page {
    min-height: 100vh;
    background: radial-gradient(circle at 20% 20%, #0b0b0b 0%, #000 100%);
    color: #fff;
    padding: 3rem 2rem;
  }

  .team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .avatar-block {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  /* --- Avatar: glow + no-overlap --- */
  .avatar {
    position: relative;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 40%, #1e1e1e 0%, #000 100%);
    color: #fff;
    font-size: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border: 3px solid #222;
    overflow: hidden;
    box-shadow:
      0 0 20px rgba(0, 186, 255, 0.25),
      0 0 40px rgba(0, 186, 255, 0.15),
      inset 0 0 10px rgba(0, 186, 255, 0.1);
    animation: pulse 4s ease-in-out infinite;
  }

  .avatar img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 2;
  }

  .avatar span {
    position: relative;
    z-index: 1;
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow:
        0 0 15px rgba(0, 186, 255, 0.3),
        0 0 35px rgba(0, 186, 255, 0.15),
        inset 0 0 10px rgba(0, 186, 255, 0.1);
    }
    50% {
      box-shadow:
        0 0 25px rgba(0, 186, 255, 0.6),
        0 0 50px rgba(0, 186, 255, 0.3),
        inset 0 0 15px rgba(0, 186, 255, 0.15);
    }
  }

  .team-info h1 {
    margin: 0;
    font-size: 2.5rem;
    line-height: 1.2;
  }

  .divider {
    height: 2px;
    background: linear-gradient(to right, transparent, #00baff 40%, transparent);
    margin: 2rem 0;
  }

  /* Body facts list */
  .stats {
    margin-top: 1rem;
    font-size: 1.1rem;
    line-height: 1.8;
    list-style: none;
    padding-left: 0;
  }

  .stats li strong {
    color: #00baff;
    font-weight: 600;
  }

  /* Elimination / clinch badges */
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.6rem;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
  }

  .pill .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
  }

  .dot-red {
    background: #ef4444;
  }

  .dot-amber {
    background: #f59e0b;
  }

  .dot-green {
    background: #22c55e;
  }

  /* Odds bars */
  .odds {
    margin-top: 1.5rem;
    max-width: 720px;
    display: grid;
    gap: 0.75rem;
  }

  .row {
    display: grid;
    grid-template-columns: 120px 1fr 64px;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
  }

  .track {
    height: 12px;
    background: #141414;
    border: 1px solid #1f1f1f;
    border-radius: 999px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #00baff, #00e1ff);
    box-shadow: 0 0 12px rgba(0, 186, 255, 0.35) inset;
    transition: width 400ms ease;
  }

  .percent {
    text-align: right;
    opacity: 0.9;
  }

  /* ----- Paths section styling ----- */
  .paths {
    max-width: 920px;
    margin-top: 2.25rem;
  }

  .paths-note {
    color: #a1a1aa;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .paths-title {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 700;
    color: #7dd3fc;
    letter-spacing: 0.02em;
  }

  .card {
    border: 1px solid #1f1f1f;
    background: rgba(18, 18, 18, 0.6);
    border-radius: 14px;
    padding: 0.75rem 0.9rem;
  }

  .card + .card {
    margin-top: 0.6rem;
  }

  .opt {
    color: #a1a1aa;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.35rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    border: 1px solid #2a2a2a;
    border-radius: 999px;
    padding: 0.35rem 0.6rem;
    margin: 0.22rem 0.22rem 0 0;
    font-size: 0.9rem;
    background: rgba(10, 10, 10, 0.6);
  }

  .chip .sep {
    width: 1px;
    height: 16px;
    background: #2a2a2a;
    margin: 0 0.5rem;
  }

  .chip .win {
    color: #30e3a3;
    font-weight: 700;
    font-size: 0.72rem;
  }

  .chip .lose {
    color: #ff6b6b;
    font-weight: 700;
    font-size: 0.72rem;
  }
</style>

<div class="page">
  <!-- Breadcrumb -->
  <div style="margin:-0.5rem 0 1rem 0;">
    <a
      href="/playoffs-projection"
      style="color:#00baff;text-decoration:none;border-bottom:1px solid rgba(0,186,255,.35);padding-bottom:2px;"
    >
      ← Back to Playoff Projections
    </a>
  </div>

  <div class="team-header">
    <div class="avatar-block">
      <div class="avatar">
        {#if avatarUrl}
          <img src={avatarUrl} alt={team.team} on:error={handleError} />
        {:else}
          <span>{initials}</span>
        {/if}
      </div>
      <div class="team-info">
        <h1>{team.team}</h1>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- BODY FACTS — Record / Points / Targets -->
  <ul class="stats">
    <li><strong>Record:</strong> {team.record}</li>
    <li><strong>Points:</strong> {team.points}</li>
    <li><strong>Division:</strong> {team.division}</li>
    <li>
      <strong>Targets:</strong> {team.targets}
      {#if team.min} (min {team.min}){/if}
    </li>
  </ul>

  <!-- Elimination / Clinch badges -->
  {#if divElim || poElim || poPoss || divClinched || poClinched}
    <div class="badges">
      {#if divClinched}
        <span class="pill">
          <span class="dot dot-green"></span> Clinched Division
        </span>
      {/if}
      {#if poClinched}
        <span class="pill">
          <span class="dot dot-green"></span> Clinched Playoff Berth
        </span>
      {/if}
      {#if divElim}
        <span class="pill">
          <span class="dot dot-red"></span> Eliminated from Division
        </span>
      {/if}
      {#if poElim}
        <span class="pill">
          <span class="dot dot-red"></span> Eliminated from Playoffs
        </span>
      {/if}
      {#if poPoss}
        <span class="pill">
          <span class="dot dot-amber"></span> Possible Elimination (Playoffs)
        </span>
      {/if}
    </div>
  {/if}

  <div class="odds">
    {#each odds as o}
      <div class="row">
        <strong>{o.label}</strong>
        <div class="track">
          <div class="fill" style={`width:${o.value}%`}></div>
        </div>
        <div class="percent">{o.value.toFixed(1)}%</div>
      </div>
    {/each}
  </div>

  <!-- ----------------- Paths to the Playoffs (after odds) ----------------- -->
  {#if divisionPaths.length || playoffPaths.length || tieOnlyPaths.length}
    <div class="paths">
      <h2 class="paths-title">Path to the Playoffs</h2>
      <div class="paths-note">
        Paths apply to the upcoming round. If Deep Analysis wasn’t selected, accuracy may be reduced.
      </div>

      {#if divisionPaths.length}
        <div style="margin-top:1rem; font-weight:600; color:#e5e7eb;">
          Clinch Division (any one):
        </div>
        {#each divisionPaths as line, i}
          <div class="card">
            <div class="opt">Option {i + 1}</div>
            {#each chipsFrom(line) as c}
              <span class="chip">
                <span>{c.team}</span>
                {#if c.outcome}
                  <span class="sep"></span>
                  <span class={c.outcome === 'WINS' ? 'win' : 'lose'}>
                    {c.outcome}
                  </span>
                {/if}
              </span>
            {/each}
          </div>
        {/each}
      {/if}

      {#if playoffPaths.length}
        <div style="margin-top:1.25rem; font-weight:600; color:#e5e7eb;">
          Clinch Playoff Spot (any one):
        </div>
        {#each playoffPaths as line, i}
          <div class="card">
            <div class="opt">Option {i + 1}</div>
            {#each chipsFrom(line) as c}
              <span class="chip">
                <span>{c.team}</span>
                {#if c.outcome}
                  <span class="sep"></span>
                  <span class={c.outcome === 'WINS' ? 'win' : 'lose'}>
                    {c.outcome}
                  </span>
                {/if}
              </span>
            {/each}
          </div>
        {/each}
      {/if}

      {#if tieOnlyPaths.length}
        <div style="margin-top:1.25rem; font-weight:600; color:#e5e7eb;">
          Can Do No Worse Than a Tie:
        </div>
        {#each tieOnlyPaths as line, i}
          <div class="card">
            <div class="opt">Option {i + 1}</div>
            {#each chipsFrom(line) as c}
              <span class="chip">
                <span>{c.team}</span>
                {#if c.outcome}
                  <span class="sep"></span>
                  <span class={c.outcome === 'WINS' ? 'win' : 'lose'}>
                    {c.outcome}
                  </span>
                {/if}
              </span>
            {/each}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
