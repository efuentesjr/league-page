<script>
  // YouTube championship videos
  const VIDEOS = [
    { id: "oijBbsTajKs", title: "2022 Perfectly Balanced | I Am Inevitable" },
    { id: "aglTvcZTmXo", title: "2023 The Rise of The Comeback Kid" },
    { id: "hdFKFDcJfBk", title: "2024 Cee Dees TDs | The Dynasty Begins" }
  ];
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <div class="player">
      <iframe
        src={`https://www.youtube.com/embed/${v.id}`}
        title={v.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
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

  .player iframe {
    width: 100%;
    height: 100%;
    display: block;
    border: none;
  }

  .caption {
    margin-top: 0.5rem;
    font-size: 1rem;
    color: var(--g111);
  }
</style>
