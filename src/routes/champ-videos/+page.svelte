<script>
  // List your local videos here (paths are from /static)
  const VIDEOS = [
    { file: "/videos/2022-Perfectly-Balanced.mp4", title: "2022 Perfectly Balanced" },
    // add more as needed:
    // { file: "/videos/2023-Championship.mp4", title: "2023 Championship" },
    // { file: "/videos/2024-Championship.mp4", title: "2024 Championship" },
  ];
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <figure class="player">
      <video controls playsinline preload="metadata">
        <source src={v.file} type="video/mp4" />
        Sorry, your browser doesn’t support the video tag.
      </video>
      <figcaption>{v.title}</figcaption>
    </figure>
  {/each}
</div>

<style>
  .wrap {
    max-width: 1100px;
    margin: 2rem auto;
    padding: 0 1rem 3rem;
    text-align: center;
    color: var(--g000);
  }

  .title {
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
    font-weight: 700;
    margin: 0 0 1.25rem;
  }

  .player {
    max-width: 960px;
    margin: 0 auto 1.5rem;
  }

  /* keep it responsive; use aspect-ratio if supported */
  .player video {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    background: #000;
  }

  .player figcaption {
    margin-top: 0.5rem;
    opacity: 0.9;
  }
</style>
