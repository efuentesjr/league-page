<script>
  export let data;
  const { slug, team, url, debug } = data;
</script>

<div style="padding:2rem;max-width:900px;">
  <h1>Playoffs Projection — {team ? team.team : 'Loading error'}</h1>
  <p style="opacity:.8">Slug: <strong>{slug}</strong></p>

  {#if team}
    <ul style="line-height:1.8;">
      <li><strong>Division:</strong> {team.division}</li>
      <li><strong>Record:</strong> {team.record}</li>
      <li><strong>Points:</strong> {team.points}</li>
      <li><strong>Chances:</strong> Division {team.status?.division} · Playoffs {team.status?.playoffs} · Title {team.status?.title}</li>
      <li><strong>Targets:</strong> {team.targets} (min {team.min})</li>
    </ul>
    <p style="margin-top:1rem;opacity:.7">Data loaded from: {url}</p>
  {:else if debug}
    <div style="margin-top:1rem;padding:1rem;border:1px solid #444;border-radius:8px;">
      <p><strong>Debug</strong></p>
      <p><strong>Env present?</strong> {debug.havePublicEnv ? 'Yes' : 'No'}</p>
      {#if url}<p><strong>URL:</strong> {url}</p>{/if}
      <p><strong>Status:</strong> {debug.status}</p>
      <pre style="white-space:pre-wrap">{debug.text}</pre>
    </div>
    <p style="opacity:.7;margin-top:.5rem;">We’ll remove this box once it’s fixed.</p>
  {/if}
</div>
