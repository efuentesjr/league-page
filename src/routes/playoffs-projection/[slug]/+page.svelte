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
    // NOTE: this still uses team.status?.tie like your original;
    // if your data uses 'title' instead, you can swap it here.
    { label: 'Tie',      value: pctNumber(team.status?.tie) }
  ];

  // ---------------- Elimination / Clinch badges ----------------
  function isEliminated(val) {
    return typeof val === 'string' && val.trim().toLowerCase() === 'eliminated';
  }

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

  // ---- Paths-to-Playoffs data ----

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
    k =
