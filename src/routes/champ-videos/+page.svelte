<script>
  // Local hosted championship videos
  const VIDEOS = [
    { src: "/videos/2022-Perfectly-Balanced-web.mp4", title: "2022 Perfectly Balanced | I Am Inevitable"},
    { src: "/videos/2023-Comeback-Kid-web.mp4", title: "2023 The Rise of The Comeback Kid" },
    { src: "/videos/2024-Cee-Dees-TDs-web.mp4", title: "2024 Cee Dees TDs | The Dynasty Begins" }
  ];
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <div class="player">
      <video controls preload="metadata" width="100%" poster="/team/path.jpg">
        <source src={v.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p class="caption">{v.title}</p>
    </div>
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
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 2rem;
  }

  .player {
    aspect-ratio: 16 / 9;
    max-width: 960px;
    margin: 0 auto 2rem;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    background: #000;
  }

  .player video {
    width: 100%;
    height: 100%;
    display: block;
  }

  .caption {
    margin-top: 0.5rem;
    font-size: 1rem;
    color: var(--g111);
  }
</style>
