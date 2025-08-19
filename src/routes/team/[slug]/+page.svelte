<script>
  export let data;
  let { title, img, logoUrl } = data;   // 👈 expect a logoUrl from API

  let imgError = false;
  function onErr() {
    imgError = true;
  }

  // If the API didn’t return logoUrl, this keeps us safe
  let logoSrc = logoUrl ?? '';
</script>

<a class="back" href="/playoffs-projection">← Back to Playoffs</a>

<h1 class="team-title">{title}</h1>

{#if !imgError}
  <div class="image-wrap">
    <img src={img} alt="Team graphic" on:error={onErr} />
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
