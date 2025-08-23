<script>
  // YouTube championship videos
  // Optional: provide your own poster path; otherwise we'll use YT's thumbnail.
  const VIDEOS = [
    { id: "oijBbsTajKs", title: "2022 Perfectly Balanced | I Am Inevitable", poster: "" },
    { id: "aglTvcZTmXo", title: "2023 The Rise of The Comeback Kid",          poster: "" },
    { id: "hdFKFDcJfBk", title: "2024 Cee Dees TDs | The Dynasty Begins",     poster: "" }
  ];

  // Track which videos are actively playing (iframe shown)
  let playing = new Set();

  const ytThumb = (id) =>
    // Try maxresdefault; if YT doesn’t have it, it will serve a fallback.
    `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  function play(id) {
    playing = new Set(playing); // ensure reactivity
    playing.add(id);
  }
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <div class="player">
      {#if playing.has(v.id)}
        <!-- Actual YouTube iframe once user clicks -->
        <iframe
          src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
          title={v.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      {:else}
        <!-- Poster (custom or YT thumbnail) with play button -->
        <button class="thumb" style={`background-image:url('${v.poster || ytThumb(v.id)}')`} on:click={() => play(v.id)} aria-label={`Play ${v.title}`}>
          <span class="play-icon">▶</span>
        </button>
      {/if}
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
    margin: 0 auto 1.25rem;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    background: #000;
    position: relative;
  }

  /* Poster */
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

  /* Play button */
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

  /* Iframe fills player */
  iframe {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
  }

  .caption {
    margin: 0.5rem 0 1.5rem;
    font-size: 1rem;
    color: var(--g111);
  }

  @media (max-width: 520px) {
    .play-icon { width: 64px; height: 64px; line-height: 64px; font-size: 28px; }
  }
</style>
