<script>
  export let data;
  // Expecting these from your load function
  let { title, img, logoUrl } = data;

  let imgError = false;
  function onErr() {
    imgError = true;
  }

  // Logo source (will be empty until your API provides it)
  let logoSrc = logoUrl ?? '';
</script>

<a class="back" href="/playoffs-projection">← Back to Playoffs</a>

<h1 class="team-title">{title}</h1>

{#if !imgError}
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
    position: relative;            /* ⬅️ anchor the badge */
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

  /* 🎯 Top-right logo overlay (only shows if logoSrc is provided) */
  .team-badge {
    position: absolute;
    top: clamp(8px, 2.5vw, 20px);
    right: clamp(8px, 3vw, 24px);
    width: clamp(44px, 12vw, 84px);
    height: clamp(44px, 12vw, 84px);
    border-radius: 14px;
    object-fit: contain;
    background: #fff;                          /* helps dark logos */
    border: 1px solid rgba(0,0,0,.15);
    box-shadow: 0 8px 24px rgba(0,0,0,.35);
    padding: 6px;
    z-index: 2;
  }
