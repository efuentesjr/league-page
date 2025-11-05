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
    if (tried < candidates.length) avatarUrl = candidates[tried];
    else avatarUrl = ''; // fallback to initials
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
    const n = Number(String(x).replace('%','').trim());
    return isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  }

  const odds = [
    { label: 'Division', value: pctNumber(team.status?.division) },
    { label: 'Playoffs', value: pctNumber(team.status?.playoffs) },
    { label: 'Tie',      value: pctNumber(team.status?.tie) }
  ];

  // ---------------- Paths to Clinch (inline; no new component) ----------------

  // Make a stable key from the current page team name
  function keyFor(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('people')) return 'peoples';
    if (n.includes('bay area')) return 'bayarea';
    if (n.includes('cee') || n.includes('tds')) return 'ceedees';
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

  // ---- DATA (exactly as provided; long lines unwrapped) ----

  // The People’s Champ
  const paths_peoples = {
    division: [
      "Do it to them LOSES",
      "WINS"
    ],
    playoffs: [
      "Do it to them LOSES",
      "Vick2times LOSES",
      "CeeDees TDs LOSES",
      "WINS",
      "bLuE BaLLeRs LOSES",
      "Brute Force Att LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "Brute Force Att LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* Pete Weber Bowl LOSES *AND* Los Loquitos LOSES *AND* Bay Area Party LOSES *AND* Loud and Stroud LOSES",
      "Brute Force Att LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* Pete Weber Bowl LOSES *AND* Los Loquitos LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "Brute Force Att LOSES *AND* Chosen one. LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Bay Area Party LOSES *AND* Loud and Stroud LOSES",
      "Brute Force Att LOSES *AND* Chosen one. LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "Brute Force Att LOSES *AND* Chosen one. LOSES *AND* SlickBears LOSES *AND* Pete Weber Bowl LOSES *AND* Los Loquitos LOSES *AND* Bay Area Party LOSES *AND* Loud and Stroud LOSES"
    ],
    tieonly: []
  };

  // Bay Area Party
  const paths_bayarea = {
    division: [],
    playoffs: [
      "Pete Weber Bowl LOSES",
      "WINS",
      "Do it to them LOSES *AND* The Comeback Ki LOSES *AND* PrimeTime Prodi LOSES",
      "TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES",
      "Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* PrimeTime Prodi LOSES",
      "Chosen one. LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES",
      "SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES",
      "Brute Force Att LOSES *AND* PrimeTime Prodi LOSES *AND* Demboyz LOSES",
      "The Comeback Ki LOSES *AND* PrimeTime Prodi LOSES *AND* Demboyz LOSES",
      "Brute Force Att LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES",
      "The Comeback Ki LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES",
      "Brute Force Att LOSES *AND* Chosen one. LOSES *AND* PrimeTime Prodi LOSES",
      "Brute Force Att LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES",
      "The Comeback Ki LOSES *AND* Chosen one. LOSES *AND* PrimeTime Prodi LOSES",
      "The Comeback Ki LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Demboyz LOSES"
    ],
    tieonly: [
      "Brute Force Att LOSES",
      "The Comeback Ki LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES *AND* Loud and Stroud LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES *AND* Loud and Stroud LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES *AND* Demboyz LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Loud and Stroud LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Demboyz LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES *AND* Loud and Stroud LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES *AND* Demboyz LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Loud and Stroud LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Demboyz LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES *AND* Loud and Stroud LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* CeeDees TDs LOSES *AND* Demboyz LOSES",
      "Do it to them LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* Los Loquitos LOSES *AND* Demboyz LOSES"
    ]
  };

  // CeeDees TDs
  const paths_ceedees = {
    division: [],
    playoffs: [
      "WINS *AND* Do it to them LOSES *AND* TexasTimeshifts LOSES",
      "WINS *AND* Do it to them LOSES *AND* Vick2times LOSES",
      "WINS *AND* Do it to them LOSES *AND* Loud and Stroud LOSES",
      "WINS *AND* Do it to them LOSES *AND* The Comeback Ki LOSES",
      "WINS *AND* Do it to them LOSES *AND* Pete Weber Bowl LOSES",
      "WINS *AND* Do it to them LOSES *AND* bLuE BaLLeRs LOSES",
      "WINS *AND* Chosen one. LOSES *AND* Loud and Stroud LOSES",
      "WINS *AND* The Comeback Ki LOSES *AND* Chosen one. LOSES",
      "WINS *AND* The Comeback Ki LOSES *AND* SlickBears LOSES",
      "WINS *AND* The Comeback Ki LOSES *AND* bLuE BaLLeRs LOSES",
      "WINS *AND* Chosen one. LOSES *AND* bLuE BaLLeRs LOSES",
      "WINS *AND* SlickBears LOSES *AND* bLuE BaLLeRs LOSES",
      "WINS *AND* Pete Weber Bowl LOSES *AND* bLuE BaLLeRs LOSES",
      "WINS *AND* bLuE BaLLeRs LOSES *AND* Demboyz LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* Bay Area Party LOSES *AND* Loud and Stroud LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* Vick2times LOSES *AND* Pete Weber Bowl LOSES *AND* Bay Area Party LOSES *AND* Loud and Stroud LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* Vick2times LOSES *AND* Pete Weber Bowl LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* Bay Area Party LOSES *AND* Loud and Stroud LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* PrimeTime Prodi LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* TexasTimeshifts LOSES *AND* SlickBears LOSES *AND* Pete Weber Bowl LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The People’s Ch LOSES *AND* Chosen one. LOSES *AND* SlickBears LOSES *AND* Pete Weber Bowl LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The Comeback Ki LOSES *AND* TexasTimeshifts LOSES *AND* Vick2times LOSES *AND* PrimeTime Prodi LOSES *AND* Bay Area Party LOSES *AND* Loud and Stroud LOSES",
      "WINS *AND* Brute Force Att LOSES *AND* The Comeback Ki LOSES *AND* TexasTimeshifts LOSES *AND* Vick2times LOSES *AND* Pete Weber Bowl LOSES *AND* Bay Area Party LOSES *AND* Demboyz LOSES"
    ],
    tieonly: []
  };

  // Choose lists for the active team tab
  const k = keyFor(team.team);
  const divisionPaths =
    k === 'peoples' ? paths_peoples.division :
    k === 'bayarea' ? paths_bayarea.division :
    k === 'ceedees' ? paths_ceedees.division : [];
  const playoffPaths =
    k === 'peoples' ? paths_peoples.playoffs :
    k === 'bayarea' ? paths_bayarea.playoffs :
    k === 'ceedees' ? paths_ceedees.playoffs : [];
  const tieOnlyPaths =
    k === 'peoples' ? paths_peoples.tieonly :
    k === 'bayarea' ? paths_bayarea.tieonly :
    k === 'ceedees' ? paths_ceedees.tieonly : [];
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
    0%, 100% {
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
    box-shadow: 0 0 12px rgba(0,186,255,.35) inset;
    transition: width 400ms ease;
  }
  .percent {
    text-align: right;
    opacity: 0.9;
  }

  /* ----- Paths section styling ----- */
  .paths { max-width: 920px; margin-top: 2.25rem; }
  .paths h3 { margin: 0 0 .25rem 0; }
  .paths-note { color:#a1a1aa; font-size:.8rem; margin-top:.25rem; }

  .card {
    border: 1px solid #1f1f1f;
    background: rgba(18,18,18,.6);
    border-radius: 14px;
    padding: .75rem .9rem;
  }
  .card + .card { margin-top: .6rem; }

  .opt { color:#a1a1aa; font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; margin-bottom:.35rem; }

  .chip {
    display:inline-flex; align-items:center;
    border:1px solid #2a2a2a; border-radius:999px;
    padding:.35rem .6rem; margin:.22rem .22rem 0 0;
    font-size:.9rem; background:rgba(10,10,10,.6);
  }
  .chip .sep { width:1px; height:16px; background:#2a2a2a; margin:0 .5rem; }
  .chip .win { color:#30e3a3; font-weight:700; font-size:.72rem; }
  .chip .lose{ color:#ff6b6b; font-weight:700; font-size:.72rem; }
</style>

<div class="page">
  <!-- Breadcrumb -->
  <div style="margin:-0.5rem 0 1rem 0;">
    <a href="/playoffs-projection"
       style="color:#00baff;text-decoration:none;border-bottom:1px solid rgba(0,186,255,.35);padding-bottom:2px;">
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
    <!-- no badges in header -->
  </div>

  <div class="divider"></div>

  <!-- BODY FACTS — Record / Points like Targets, simple text -->
  <ul class="stats">
    <li><strong>Record:</strong> {team.record}</li>
    <li><strong>Points:</strong> {team.points}</li>
    <li><strong>Division:</strong> {team.division}</li>
    <li>
      <strong>Targets:</strong> {team.targets}
      {#if team.min} (min {team.min}){/if}
    </li>
  </ul>

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

  <!-- ----------------- Paths to the Playoffs (placed after Tie) ----------------- -->
  {#if divisionPaths.length || playoffPaths.length || tieOnlyPaths.length}
    <div class="paths">
      <h3 class="text-lg" style="color:#7dd3fc;">Path to the Playoffs</h3>
      <div class="paths-note">
        Paths apply to the upcoming round. If Deep Analysis wasn’t selected, accuracy may be reduced.
      </div>

      {#if divisionPaths.length}
        <div style="margin-top:1rem; font-weight:600; color:#e5e7eb;">Clinch Division (any one):</div>
        {#each divisionPaths as line, i}
          <div class="card">
            <div class="opt">Option {i + 1}</div>
            {#each chipsFrom(line) as c}
              <span class="chip">
                <span>{c.team}</span>
                {#if c.outcome}
                  <span class="sep"></span>
                  <span class={c.outcome === 'WINS' ? 'win' : 'lose'}>{c.outcome}</span>
                {/if}
              </span>
            {/each}
          </div>
        {/each}
      {/if}

      {#if playoffPaths.length}
        <div style="margin-top:1.25rem; font-weight:600; color:#e5e7eb;">Clinch Playoff Spot (any one):</div>
        {#each playoffPaths as line, i}
          <div class="card">
            <div class="opt">Option {i + 1}</div>
            {#each chipsFrom(line) as c}
              <span class="chip">
                <span>{c.team}</span>
                {#if c.outcome}
                  <span class="sep"></span>
                  <span class={c.outcome === 'WINS' ? 'win' : 'lose'}>{c.outcome}</span>
                {/if}
              </span>
            {/each}
          </div>
        {/each}
      {/if}

      {#if tieOnlyPaths.length}
        <div style="margin-top:1.25rem; font-weight:600; color:#e5e7eb;">Can Do No Worse Than a Tie:</div>
        {#each tieOnlyPaths as line, i}
          <div class="card">
            <div class="opt">Option {i + 1}</div>
            {#each chipsFrom(line) as c}
              <span class="chip">
                <span>{c.team}</span>
                {#if c.outcome}
                  <span class="sep"></span>
                  <span class={c.outcome === 'WINS' ? 'win' : 'lose'}>{c.outcome}</span>
                {/if}
              </span>
            {/each}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
