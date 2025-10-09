<script>
  export let data;
  const { slug, team, avatarBasePath } = data;

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
    { label: 'Title', value: pctNumber(team.status?.title) }
  ];
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

  .avatar {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1a1a, #333);
    color: #fff;
    font-size: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border: 3px solid #222;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .team-info h1 {
    margin: 0;
    font-size: 2.5rem;
    line-height: 1.2;
  }

  .team-info p {
    margin: 0.4rem 0;
    opacity: 0.8;
    font-size: 1rem;
  }

  /* Badges */
  .badges {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .badge {
    background: linear-gradient(90deg, #00baff, #007bff);
    color: #fff;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.3px;
    box-shadow: 0 0 10px rgba(0,186,255,0.3);
    white-space: nowrap;
  }

  .points-badge {
    background: linear-gradient(90deg, #00ff9d, #00b37a);
    box-shadow: 0 0 10px rgba(0,255,157,0.25);
  }

  .divider {
    height: 2px;
    background: linear-gradient(to right, transparent, #00baff 40%, transparent);
    margin: 2rem 0;
  }

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
</style>

<div class="page">
  <div class="team-header">
    <div class="avatar-block">
      <div class="avatar">
        {#if avatarUrl}
          <img src={avatarUrl} alt={team.team} on:error={handleError} />
        {:else}
          {initials}
        {/if}
      </div>
      <div class="team-info">
        <h1>{team.team}</h1>
        <p>Slug: <strong>{slug}</strong></p>
      </div>
    </div>

    <div class="badges">
      <div class="badge">Record: {team.record}</div>
      <div class="badge points-badge">Points: {team.points}</div>
    </div>
  </div>

  <div class="divider"></div>

  <ul class="stats">
    <li><strong>Division:</strong> {team.division}</li>
    <li><strong>Record:</strong> {team.record}</li>
    <li><strong>Points:</strong> {team.points}</li>
    <li>
      <strong>Chances:</strong>
      Division {team.status?.division} · Playoffs {team.status?.playoffs} · Title {team.status?.title}
    </li>
    <li><strong>Targets:</strong> {team.targets} (min {team.min})</li>
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
</div>
