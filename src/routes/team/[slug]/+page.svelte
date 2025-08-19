<script>
  // data can be undefined during SSR if load() throws/redirects
  export let data = {};

  // Safely read fields with fallbacks
  let title = data?.title ?? 'Team';
  let img = data?.img ?? '';
  let logoSrc = data?.logoUrl ?? ''; // will be empty until your API adds it

  let imgError = false;
  function onErr() {
    imgError = true;
  }

  // Optional: if title updates later, keep derived values in sync
  $: title = data?.title ?? title;
  $: img = data?.img ?? img;
  $: logoSrc = data?.logoUrl ?? logoSrc;
</script>

<a class="back" href="/playoffs-projection">← Back to Playoffs</a>

<h1 class="team-title">{title}</h1>

{#if !imgError && img}
  <div class="image-wrap">
    <img src={img} alt="Team graphic" on:error={onErr} />

    {#if logoSrc}
      <img
        class="team-badge"
        src={logoSrc}
        alt={`${title} logo`}
        on:error={() => (logoSrc = '')}
        referrerpolicy="no-referrer"
      />
    {/if}
  </div>
{:else}
  <div class="placeholder">
    <p><strong>Image not found.</strong></p>
    <p>Upload your file to <code>static/team/path.jpg</code> and refresh.</p>
  </div>
{/if}
