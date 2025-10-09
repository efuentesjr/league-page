<script>
  export let data;
  const { slug, team, avatarBasePath } = data;

  // Build possible avatar sources
  const candidates = [
    `${avatarBasePath}/${slug}.png`,
    `${avatarBasePath}/${slug}.jpg`
  ];

  let avatarUrl = '';
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
</script>

<style>
  .team-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }

  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #111;
    color: #fff;
    font-size: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border: 2px solid #333;
    overflow: hidden;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .team-info h1 {
    margin: 0;
    font-size: 2.2rem;
  }

  .team-info p {
    margin: 0.25rem 0;
    opacity: 0.8;
  }

  ul {
    line-height: 1.8;
    list-style: none;
    padding-left: 2rem;
  }
</style>

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

<ul>
  <li><strong>Division:</strong> {team.division}</li>
  <li><strong>Record:</strong> {team.record}</li>
  <li><strong>Points:</strong> {team.points}</li>
  <li>
    <strong>Chances:</strong>
    Division {team.status?.division} ·
    Playoffs {team.status?.playoffs} ·
    Title {team.status?.title}
  </li>
  <li><strong>Targets:</strong> {team.targets} (min {team.min})</li>
</ul>
