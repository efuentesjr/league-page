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
    { label: 'Tie',      value: pctNumber(team.status?.tie) }
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

  const divElim     = isEliminated(team.status?.division);
  const poElim      = isEliminated(team.status?.playoffs);
  const poPoss      = isPossibleElim(team.status?.playoffs);
  const divClinched = isClinched(team.status?.division);
  const poClinched  = isClinched(team.status?.playoffs);

  // ---------------- Paths to Clinch (inline; no new component) ----------------

  // Make a stable key from the current page team name
  function keyFor(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('brute')) return 'bruteforce';
    if (n.includes('slick')) return 'slick';
    if (n.includes('baller')) return 'blueballers';
    if (n.includes('prime')) return 'primetime';
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

  // ---- Paths-to-Playoffs data (NEW) ----

  // Brute Force Att: already guaranteed at least a tie for a playoff spot.
  const paths_bruteforce = {
    division: [],
    playoffs: [],
    tieonly: [
      "Already guaranteed at least a tie for a playoff spot (points to resolve)."
    ]
  };

  // SlickBears
  // Division:
  //   1) WINS *AND* bLuE BaLLeRs LOSES
  // Playoffs:
  //   1) WINS
  //   2) Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES
  // Tie:
  //   1) Blue Tent All-S LOSES *AND* PrimeTime Prodi LOSES
  //   2) PrimeTime Prodi LOSES *AND* TexasTimeshifts LOSES
  const paths_slick = {
    division: [
      "SlickBears WINS *AND* bLuE BaLLeRs LOSES"
    ],
    playoffs: [
      "SlickBears WINS",
      "Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES"
    ],
    tieonly: [
      "Blue Tent All-S LOSES *AND* PrimeTime Prodi LOSES",
      "PrimeTime Prodi LOSES *AND* TexasTimeshifts LOSES"
    ]
  };

  // bLuE BaLLeRs
  // Playoffs:
  //   1) WINS *AND* PrimeTime Prodi LOSES *AND* TexasTimeshifts LOSES
  //   2) WINS *AND* Blue Tent All-S LOSES *AND* PrimeTime Prodi LOSES
  //   3) WINS *AND* Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES
  // Tie:
  //   1) WINS
  //   2) Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES
  const paths_blueballers = {
    division: [],
    playoffs: [
      "bLuE BaLLeRs WINS *AND* PrimeTime Prodi LOSES *AND* TexasTimeshifts LOSES",
      "bLuE BaLLeRs WINS *AND* Blue Tent All-S LOSES *AND* PrimeTime Prodi LOSES",
      "bLuE BaLLeRs WINS *AND* Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES"
    ],
    tieonly: [
      "bLuE BaLLeRs WINS",
      "Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES"
    ]
  };

  // PrimeTime Prodi
  // Playoffs:
  //   1) WINS *AND* Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES
  // Tie:
  //   1) WINS *AND* SlickBears LOSES *AND* Do it to them LOSES *AND* bLuE BaLLeRs LOSES *AND* TexasTimeshifts LOSES
  //   2) WINS *AND* SlickBears LOSES *AND* Blue Tent All-S LOSES *AND* bLuE BaLLeRs LOSES *AND* Bay Area Party LOSES
  const paths_primetime = {
    division: [],
    playoffs: [
      "PrimeTime Prodi WINS *AND* Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES"
    ],
    tieonly: [
      "PrimeTime Prodi WINS *AND* SlickBears LOSES *AND* Do it to them LOSES *AND* bLuE BaLLeRs LOSES *AND* TexasTimeshifts LOSES",
      "PrimeTime Prodi WINS *AND* SlickBears LOSES *AND* Blue Tent All-S LOSES *AND* bLuE BaLLeRs LOSES *AND* Bay Area Party LOSES"
    ]
  };

  // Choose lists for the active team tab
  const k = keyFor(team.team);
  const divisionPaths =
    k === 'bruteforce'   ? paths_bruteforce.division   :
    k === 'slick'        ? paths_slick.division        :
    k === 'blueballers'  ? paths_blueballers.division  :
    k === 'primetime'    ? paths_primetime.division    : [];
  const playoffPaths =
    k === 'bruteforce'   ? paths_bruteforce.playoffs   :
    k === 'slick'        ? paths_slick.playoffs        :
    k === 'blueballers'  ? paths_blueballers.playoffs  :
    k === 'primetime'    ? paths_primetime.playoffs    : [];
  const tieOnlyPaths =
    k === 'bruteforce'   ? paths_bruteforce.tieonly    :
    k === 'slick'        ? paths_slick.tieonly         :
    k === 'blueballers'  ? paths_blueballers.tieonly   :
    k === 'primetime'    ? paths_primetime.tieonly     : [];
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

  /* Elimination / clinch badges */
  .badges { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.6rem; }
  .pill {
    display:inline-flex; align-items:center; gap:.4rem;
    padding:.25rem .55rem; border-radius:999px; font-size:.75rem; font-weight:600;
    border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04);
  }
  .pill .dot { width:.5rem; height:.5rem; border-radius:999px; }
  .dot-red   { background:#ef4444; }
  .dot-amber { background:#f59e0b; }
  .dot-green { background:#22c55e; }

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
  .paths-note { color:#a1a1aa; font-size:.8rem; margin-top:.25rem; }

  .paths-title {
    margin: 0 0 .25rem 0;
    font-size: 1rem;
    font-weight: 700;
    color: #7dd3fc;
    letter-spacing: .02em;
  }

  .card {
    border: 1px solid #1f1f1f;
    background: rgba(18,18,18,.6);
    border-radius: 14px;
    padding: .75rem .9rem;
  }
  .card + .card { margin-top: .6rem; }

  .opt { color:#a1a1aa; font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; margin-bottom:.35rem; }

  .c
