<!-- league-page/src/routes/playoffs-projection/[slug]/+page.svelte -->
<script>
  export let data;
  const { slug, team, avatarBasePath } = data;

  // Avatar candidates (PNG then JPG)
  const candidates = [`${avatarBasePath}/${slug}.png`, `${avatarBasePath}/${slug}.jpg`];
  let avatarUrl = candidates[0];
  let tried = 0;

  function handleError() {
    tried++;
    if (tried < candidates.length) avatarUrl = candidates[tried];
    else avatarUrl = ''; // fallback to initials
  }

  const initials = (team?.team || '')
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

  // NEW JSON: status is { division, playoffs, title }
  const odds = [
    { label: 'Division', value: pctNumber(team?.status?.division) },
    { label: 'Playoffs', value: pctNumber(team?.status?.playoffs) },
    { label: 'Title', value: pctNumber(team?.status?.title) }
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

  const divElim = isEliminated(team?.status?.division);
  const poElim = isEliminated(team?.status?.playoffs);
  const poPoss = isPossibleElim(team?.status?.playoffs);
  const divClinched = isClinched(team?.status?.division);
  const poClinched = isClinched(team?.status?.playoffs);

  // ---------------- Paths to Clinch (inline; no new component) ----------------

  // Make a stable key from the current page team name (handles truncated names)
  function keyFor(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('blue tent')) return 'bluetent';
    if (n.includes('baller')) return 'blueballers';
    if (n.includes('prime')) return 'primetime';
    if (n.includes('timeshi')) return 'texastimeshifts';
    return n.replace(/\s+/g, '');
  }

  // Split one OR-path into chips (we show chips for each *AND* condition)
  function chipsFrom(line) {
    return String(line)
      .split(/\*AND\*/i)
      .map((s) => s.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .map((chunk) => {
        const m = chunk.match(/(.+?)\s+(WINS|LOSES)$/i);
        return m ? { team: m[1].trim(), outcome: m[2].toUpperCase() } : { team: chunk, outcome: '' };
      });
  }

  // ---- Paths-to-Playoffs data ----
  const paths_bluetent = {
    division: [],
    playoffs: [],
    tieonly: ['Blue Tent All-S WINS *AND* bLuE BaLLeRs LOSES *AND* TexasTimeshifts LOSES']
  };

  const paths_blueballers = {
    division: [],
    playoffs: [
      'bLuE BaLLeRs WINS *AND* PrimeTime Prodi LOSES',
      'bLuE BaLLeRs WINS *AND* TexasTimeshifts LOSES'
    ],
    tieonly: ['bLuE BaLLeRs WINS', 'TexasTimeshifts LOSES']
  };

  const paths_primetime = {
    division: [],
    playoffs: ['bLuE BaLLeRs LOSES', 'PrimeTime Prodi WINS', 'TexasTimeshifts LOSES'],
    tieonly: []
  };

  const paths_texastimeshifts = {
    division: [],
    playoffs: [
      'TexasTimeshifts WINS *AND* bLuE BaLLeRs LOSES',
      'TexasTimeshifts WINS *AND* PrimeTime Prodi LOSES'
    ],
    tieonly: ['bLuE BaLLeRs LOSES', 'TexasTimeshifts WINS']
  };

  // Choose lists for the active team tab
  const k = keyFor(team?.team);

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

  function fmt(x, fallback = '--') {
    if (x === null || x === undefined) return fallback;
    const s = String(x).trim();
    return s.length ? s : fallback;
  }

  function fmtNum(x, fallback = '--') {
    if (x === null || x === undefined || x === '') return fallback;
    const n = Number(x);
    return isFinite(n) ? n.toLocaleString() : fmt(x, fallback);
  }
</script>

<svelte:head>
  <title>{team?.team || 'Playoffs Projection'}</title>
</svelte:head>

<div class="wrap">
  <header class="hdr">
    <div class="avatar">
      {#if avatarUrl}
        <img src={avatarUrl} alt={team?.team} on:error={handleError} />
      {:else}
        <div class="initials" aria-label="Team initials">{initials}</div>
      {/if}
    </div>

    <div class="meta">
      <div class="titleRow">
        <h1 class="teamName">{team?.team}</h1>
        <div class="badges">
          {#if divClinched}<span class="badge ok">Division Clinched</span>{/if}
          {#if divElim}<span class="badge bad">Division Eliminated</span>{/if}
          {#if poClinched}<span class="badge ok">Playoffs Clinched</span>{/if}
          {#if poElim}<span class="badge bad">Playoffs Eliminated</span>{/if}
          {#if poPoss}<span class="badge hold">Possible Elim</span>{/if}
        </div>
      </div>

      <div class="sub">
        <span class="pill">Div {fmt(team?.division)}</span>
        <span class="pill">Record {fmt(team?.record)}</span>
        <span class="pill">{fmtNum(team?.points)} pts</span>
      </div>

      <div class="targets">
        <div class="trow">
          <span class="tlabel">Targets</span>
          <span class="tval">{fmt(team?.targets)}</span>
        </div>
        <div class="trow">
          <span class="tlabel">Division Targets</span>
          <span class="tval">{fmt(team?.divisionTargets)}</span>
        </div>
        <div class="trow">
          <span class="tlabel">Min</span>
          <span class="tval">{fmt(team?.min)}</span>
        </div>
        <div class="trow">
          <span class="tlabel">Games In</span>
          <span class="tval">{fmt(team?.gamesIn)}</span>
        </div>
      </div>
    </div>
  </header>

  <section class="card">
    <h2 class="h2">Odds</h2>

    <div class="odds">
      {#each odds as o}
        <div class="od">
          <div class="odTop">
            <span class="odLabel">{o.label}</span>
            <span class="odVal">{o.value.toFixed(1)}%</span>
          </div>
          <div class="bar" role="progressbar" aria-valuenow={o.value} aria-valuemin="0" aria-valuemax="100">
            <div class="fill" style={`width:${o.value}%;`} />
          </div>
        </div>
      {/each}
    </div>
  </section>

  {#if divisionPaths.length || playoffPaths.length || tieOnlyPaths.length}
    <section class="card">
      <h2 class="h2">Paths</h2>

      {#if divisionPaths.length}
        <div class="pathsBlock">
          <h3 class="h3">Division</h3>
          {#each divisionPaths as line, idx}
            <div class="pathRow">
              <div class="orTag">{idx === 0 ? 'IF' : 'OR'}</div>
              <div class="chips">
                {#each chipsFrom(line) as c}
                  <span class={"chip " + (c.outcome === 'WINS' ? 'win' : c.outcome === 'LOSES' ? 'lose' : 'plain')}>
                    <span class="chipTeam">{c.team}</span>
                    {#if c.outcome}<span class="chipOut">{c.outcome}</span>{/if}
                  </span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if playoffPaths.length}
        <div class="pathsBlock">
          <h3 class="h3">Playoffs</h3>
          {#each playoffPaths as line, idx}
            <div class="pathRow">
              <div class="orTag">{idx === 0 ? 'IF' : 'OR'}</div>
              <div class="chips">
                {#each chipsFrom(line) as c}
                  <span class={"chip " + (c.outcome === 'WINS' ? 'win' : c.outcome === 'LOSES' ? 'lose' : 'plain')}>
                    <span class="chipTeam">{c.team}</span>
                    {#if c.outcome}<span class="chipOut">{c.outcome}</span>{/if}
                  </span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if tieOnlyPaths.length}
        <div class="pathsBlock">
          <h3 class="h3">Tie-Only (can do no worse than tied for a spot)</h3>
          {#each tieOnlyPaths as line, idx}
            <div class="pathRow">
              <div class="orTag">{idx === 0 ? 'IF' : 'OR'}</div>
              <div class="chips">
                {#each chipsFrom(line) as c}
                  <span class={"chip " + (c.outcome === 'WINS' ? 'win' : c.outcome === 'LOSES' ? 'lose' : 'plain')}>
                    <span class="chipTeam">{c.team}</span>
                    {#if c.outcome}<span class="chipOut">{c.outcome}</span>{/if}
                  </span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .wrap { max-width: 980px; margin: 0 auto; padding: 18px 14px 28px; }
  .hdr { display: grid; grid-template-columns: 88px 1fr; gap: 14px; align-items: start; }
  .avatar { width: 88px; height: 88px; border-radius: 18px; overflow: hidden; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .initials { width: 100%; height: 100%; display: grid; place-items: center; font-weight: 800; letter-spacing: 0.5px; font-size: 22px; }

  .meta { display: grid; gap: 10px; }
  .titleRow { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .teamName { margin: 0; font-size: 24px; line-height: 1.15; }
  .badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .badge { font-size: 12px; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); }
  .badge.ok { background: rgba(16,185,129,0.18); border-color: rgba(16,185,129,0.28); }
  .badge.bad { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.28); }
  .badge.hold { background: rgba(245,158,11,0.18); border-color: rgba(245,158,11,0.28); }

  .sub { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill { font-size: 12px; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); }

  .targets { display: grid; gap: 6px; padding-top: 2px; }
  .trow { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; }
  .tlabel { opacity: 0.75; }
  .tval { font-weight: 600; }

  .card { margin-top: 14px; padding: 14px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); }
  .h2 { margin: 0 0 10px; font-size: 16px; }
  .h3 { margin: 12px 0 8px; font-size: 14px; opacity: 0.9; }

  .odds { display: grid; gap: 12px; }
  .odTop { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; margin-bottom: 6px; }
  .odLabel { opacity: 0.8; }
  .odVal { font-weight: 700; }

  .bar { height: 10px; border-radius: 999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.06); }
  .fill { height: 100%; background: rgba(255,255,255,0.55); }

  .pathsBlock { margin-top: 8px; }
  .pathRow { display: grid; grid-template-columns: 44px 1fr; gap: 10px; align-items: start; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.08); }
  .pathRow:first-of-type { border-top: 0; }
  .orTag { font-size: 11px; opacity: 0.7; padding-top: 4px; }

  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { display: inline-flex; gap: 8px; align-items: center; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); font-size: 12px; }
  .chip.win { background: rgba(16,185,129,0.14); border-color: rgba(16,185,129,0.22); }
  .chip.lose { background: rgba(239,68,68,0.14); border-color: rgba(239,68,68,0.22); }
  .chipTeam { font-weight: 700; }
  .chipOut { opacity: 0.8; font-weight: 700; }
</style>
