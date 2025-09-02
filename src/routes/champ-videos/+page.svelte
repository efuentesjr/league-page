<script>
  const VIDEOS = [
    { id: "oijBbsTajKs", title: "2024 Cee Dees TDs - The Dynasty Begins", poster: "" },
    { id: "aglTvcZTmXo", title: "2023 The Rise of The Comeback Kid",          poster: "" },
    { id: "hdFKFDcJfBk", title: "2022 Perfectly Balanced - I Am Inevitable",     poster: "" }
  ];

  let playing = new Set();
  const ytThumb = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  function play(id) {
    playing = new Set(playing);
    playing.add(id);
  }
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <div class="player">
      {#if playing.has(v.id)}
        <iframe
          src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
          title={v.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      {:else}
        <!-- Poster with title overlay -->
        <button
          class="thumb"
          style={`background-image:url('${v.poster || ytThumb(v.id)}')`}
          on:click={() => play(v.id)}
          aria-label={`Play ${v.title}`}
        >
          <div class="overlay-title">{v.title}</div>
          <span class="play-icon">▶</span>
        </button>
      {/if}
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
    margin: 0 auto 1.5rem;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    background: #000;
    position: relative;
  }

  .thumb {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    cursor: pointer;
    background-size: cover;
    background-position: center;
    position: relative;
  }

  .overlay-title {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
    background: rgba(0,0,0,0.5);
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
  }

  .play-icon {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 84px;
    height: 84px;
    line-height: 84px;
    border-radius: 50%;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 36px;
    box-shadow: 0 6px 18px rgba(0,0,0,.4);
    transition: transform .12s ease, background .12s ease;
  }

  .thumb:hover .play-icon { transform: scale(1.06); background: rgba(0,0,0,0.7); }

  iframe {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
  }
</style>
