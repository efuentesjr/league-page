<script>
  export let data = {};

  let title = data?.title ?? 'Team';
  let img = data?.img ?? '';
  let logoSrc = data?.logoUrl ?? '';   // if empty, we’ll show initials instead

  // Derive initials from the title, e.g., "Brute Force" -> "BF"
  const initials = (title || '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  let imgError = false;
  function onErr() {
    imgError = true;
  }
</script>

<a class="back" href="/playoffs-projection">← Back to Playoffs</a>

<h1 class="team-title">{title}</h1>

{#if !imgError && img}
  <div class="image-wrap">
    <img src={img} alt="Team graphic" on:error={onErr} />

    {#if logoSrc}
      <!-- Real logo from API -->
      <img
        class="team-badge"
        src={logoSrc}
        alt={`${title} logo`}
        on:error={() => (logoSrc = '')}
        referrerpolicy="no-referrer"
      />
    {:else}
      <!-- Initials fallback badge -->
      <div class="team-badge badge-fallback" aria-label="Team logo placeholder">
        {initials}
      </div>
    {/if}
  </div>
{:else}
  <div class="placeholder">
    <p><strong>Image not found.</strong></p>
    <p>Upload your file to <code>static/team/path.jpg</code> and refresh.</p>
  </div>
{/if}

<style>
  .back {
    display: inline-block;
    margin-top: .5rem;
    color: #4da6ff;
    text-decoration: none;
    font-weight: 700;
  }
  .back:hover { text-decoration: underline; }

  .team-title {
    margin: .75rem 0 .75rem;
    font-weight: 900;
    font-size: clamp(1.4rem, 3.2vw, 2.1rem);
  }

  .image-wrap {
    position: relative;  /* anchor the overlay */
    max-width: 980px;
    margin: 0 auto;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 6px 24px rgba(0,0,0,.12);
  }
  .image-wrap img {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Top-right overlay badge (shared size/pos) */
  .team-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 60px;
    height: 60px;
    border-radius: 12px;
    z-index: 2;
    box-shadow: 0 4px 12px rgba(0,0,0,.25);
    border: 1px solid rgba(0,0,0,.15);
  }

  /* Image logo */
  .team-badge:not(.badge-fallback) {
    object-fit: contain;
    background: #fff;
    padding: 4px;
  }

  /* Initials fallback */
  .badge-fallback {
    display: grid;
    place-items: center;
    background: #111;
    color: #fff;
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: .5px;
  }

  .placeholder {
    max-width: 720px;
    margin: 1rem auto;
    padding: 1rem;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    color: #334155;
  }
  .placeholder code {
    background: #0b1220;
    color: #e5e7eb;
    padding: 0 .25rem;
    border-radius: 4px;
  }

  :global(html.dark) .placeholder {
    background: #0b0b0c;
    border-color: #1f2937;
    color: #e5e7eb;
  }
  :global(html.dark) .placeholder code {
    background: #111827;
    color: #f3f4f6;
  }
</style>
