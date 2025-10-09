<script>
  export let data;
  const { slug, team } = data;

  // Avatar candidates (PNG then JPG) from static/playoffs-projection
  const candidates = [
    `/playoffs-projection/${slug}.png`,
    `/playoffs-projection/${slug}.jpg`
  ];
  let avatarUrl = candidates[0];
  let tried = 0;

  function handleError() {
    tried++;
    if (tried < candidates.length) avatarUrl = candidates[tried];
    else avatarUrl = ''; // fallback to initials
  }

  const initials = String(team?.team || '')
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

  .team-info p {
    margin: 0.4rem 0;
    opacity: 0.8;
    font-size: 1rem;
  }

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
    box-shadow: 0 0 10px rgba(0,186,255,0.);
