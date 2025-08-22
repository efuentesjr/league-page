<script>
  // Local championship video sources (served from /static/videos)
  const VIDEOS = [
    { file: "/videos/2022-Perfectly-Balanced-web.mp4", title: "I Am Inevitable", poster: "/videos/2022-Perfectly-Balanced-poster.jpg" },
    { file: "/videos/2023-Comeback-Kid-web.mp4",       title: "The Rise of The Comeback Kid",       poster: "/videos/2023-Comeback-Kid-poster.jpg" },
    { file: "/videos/2024-Cee-Dees-TDs-web.mp4",       title: "The Dynasty Begins",       poster: "/videos/2024-Cee-Dees-TDs-poster.jpg" }
  ];
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <figure class="card">
      <video controls playsinline preload="metadata" poster={v.poster}>
        <source src={v.file} type="video/mp4" />
        Sorry, your browser doesn’t support the video tag.
      </video>
      <figcaption class="caption">{v.title}</figcaption>
    </figure>
  {/each}
</div>

<style>
  .wrap {
    max-width: 1100px;
    margin: 2rem auto 3rem;
    padding: 0 1rem;
    color: var(--g000);
  }

  .title {
    text-align: center;
    margin: 0 0 1.25rem;
    font-weight: 700;
    font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  }

  .card {
    max-width: 960px;
    margin: 0.75rem auto 1.75rem;
  }

  .card video {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 12px;
    background: #000;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
  }

  .caption {
    text-align: center;
    margin-top: .5rem;
    opacity: .9;
    font-size: .95rem;
  }
</style>
