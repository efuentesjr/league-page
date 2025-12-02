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

  // Read "title" or "tie" field from status (support both)
  const tieRaw = team?.status?.title ?? team?.status?.tie;

  const odds = [
    { label: 'Division', value: pctNumber(team.status?.division) },
    { label: 'Playoffs', value: pctNumber(team.status?.playoffs) },
    { label: 'Tie', value: pctNumber(tieRaw) }
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

  // ---------------- Paths to Clinch (inline; updated with new data) ----------------

  // Make a stable key from the current page team name
  function keyFor(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('brute')) return 'bruteforce';
    if (n.includes('slick')) return 'slick';
    if (n.includes('baller')) return 'blueballers';
    if (n.includes('prime')) return 'primetime';
    if (n.includes('blue tent')) return 'bluetent';
    if (n.includes('timeshift')) return 'texastimeshifts'; // matches TexasTimeshifts / TexasTimeshi
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

  // ---- Paths-to-Playoffs data (UPDATED) ----

  // Blue Tent All-S can do no worse than a tie if:
  // 1) WINS *AND* bLuE BaLLeRs LOSES *AND* TexasTimeshifts LOSES
  const paths_bluetent = {
    division: [],
    playoffs: [],
    tieonly: [
      'Blue Tent All-S WINS *AND* bLuE BaLLeRs LOSES *AND* TexasTimeshifts LOSES'
    ]
  };

  // bLuE BaLLeRs clinches a playoff spot:
  // 1) WINS *AND* PrimeTime Prodi LOSES, OR;
  // 2) WINS *AND* TexasTimeshifts LOSES
  // Can do no worse than a tie if:
  // 1) WINS, OR;
  // 2) TexasTimeshifts LOSES
  const paths_blueballers = {
    division: [],
    playoffs: [
      'bLuE BaLLeRs WINS *AND* PrimeTime Prodi LOSES',
      'bLuE BaLLeRs WINS *AND* TexasTimeshifts LOSES'
    ],
    tieonly: ['bLuE BaLLeRs WINS', 'TexasTimeshifts LOSES']
  };

  // PrimeTime Prodi clinches a playoff spot:
  // 1) bLuE BaLLeRs LOSES, OR;
  // 2) WINS, OR;
  // 3) TexasTimeshifts LOSES
  const paths_primetime = {
    division: [],
    playoffs: [
      'bLuE BaLLeRs LOSES',
      'PrimeTime Prodi WINS',
      'TexasTimeshifts LOSES'
    ],
    tieonly: []
  };

  // TexasTimeshifts clinches a playoff spot:
  // 1) WINS *AND* bLuE BaLLeRs LOSES, OR;
  // 2) WINS *AND* PrimeTime Prodi LOSES
  // Can do no worse than a tie if:
  // 1) bLuE BaLLeRs LOSES, OR;
  // 2) WINS
  const paths_texastimeshifts = {
    division: [],
    playoffs: [
      'TexasTimeshifts WINS *AND* bLuE BaLLeRs LOSES',
      'TexasTimeshifts WINS *AND* PrimeTime Prodi LOSES'
    ],
    tieonly: ['bLuE BaLLeRs LOSES', 'TexasTimeshifts WINS']
  };

  // Brute Force Att: unchanged from your prior note (still show tie-only note)
  const paths_bruteforce = {
    division: [],
    playoffs: [],
    tieonly: [
      'Already guaranteed at least a tie for a playoff spot (points to resolve).'
    ]
  };

  // SlickBears (kept your prior conditions)
  const paths_slick = {
    division: ['SlickBears WINS *AND* bLuE BaLLeRs LOSES'],
    playoffs: [
      'SlickBears WINS',
      'Blue Tent All-S LOSES *AND* TexasTimeshifts LOSES'
    ],
    tieonly: [
      'Blue Tent All-S LOSES *AND* PrimeTime Prodi LOSES',
      'PrimeTime Prodi LOSES *AND* TexasTimeshifts LOSES'
    ]
  };

  // Choose lists for the active team tab
  const k = keyFor(team.team);

  const divisionPaths =
    k === 'bruteforce'
      ? paths_bruteforce.division
      : k === 'slick'
      ? paths_slick.division
      : k === 'blueballers'
      ? paths_blueballers.division
      : k === 'primetime'
      ? paths_primetime.division
      : k === 'bluetent'
      ? paths_bluetent.division
      : k === 'texastimeshifts'
      ? paths_texastimeshifts.division
      : [];

  const playoffPaths =
    k === 'bruteforce'
      ? paths_bruteforce.playoffs
      : k === 'slick'
      ? paths_slick.playoffs
      : k === 'blueballers'
      ? paths_blueballers.playoffs
      : k === 'primetime'
      ? paths_primetime.playoffs
      : k === 'bluetent'
      ? paths_bluetent.playoffs
      : k === 'texastimeshifts'
      ? paths_texastimeshifts.playoffs
      : [];

  const tieOnlyPaths =
    k === 'bruteforce'
      ? paths_bruteforce.tieonly
      : k === 'slick'
      ? paths_slick.tieonly
      : k === 'blueballers'
      ? paths_blueballers.tieonly
      : k === 'primetime'
      ? paths_primetime.tieonly
      : k === 'bluetent'
      ? paths_bluetent.tieonly
      : k === 'texastimeshifts'
      ? paths_texastimeshifts.tieonly
      : [];
</script>
