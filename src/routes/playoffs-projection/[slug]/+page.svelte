<script>
  export let data;
  const { slug, team } = data;
</script>

<div style="padding: 2rem; max-width: 900px;">
  <h1 style="margin:0 0 0.5rem 0;">Playoffs Projection — {team.team}</h1>
  <p style="opacity:.8;margin:0 0 1rem 0;">Slug: <strong>{slug}</strong></p>

  <ul style="line-height:1.8;">
    <li><strong>Division:</strong> {team.division}</li>
    <li><strong>Record:</strong> {team.record}</li>
    <li><strong>Points:</strong> {team.points}</li>
    <li><strong>Chances:</strong>
      Division {team.status?.division} ·
      Playoffs {team.status?.playoffs} ·
      Title {team.status?.title}
    </li>
    <li><strong>Targets:</strong> {team.targets} (min {team.min})</li>
  </ul>

  <p style="margin-top:1rem; opacity:.7;">
    Data is live from projections JSON. Next step: add avatar fallback and nicer layout.
  </p>
</div>
