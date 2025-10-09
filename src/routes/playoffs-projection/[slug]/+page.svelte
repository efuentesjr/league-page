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
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
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

  .divider {
    height: 2px;
    background: linear-gradient(to right, transparent, #00baff 40%, transparent);
    margin: 2rem 0;
  }
</style>

<div class="page">
  <div class="team-header">
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
</div>
