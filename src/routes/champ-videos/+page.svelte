<script>
  // Use absolute URLs for assets under `static/` → they’re served from the site root.
  const VIDEOS = [
    {
      key: '2024',
      title: '2024 Cee Dees TDs - The Dynasty Begins',
      src:    'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2024-Cee-Dees-TDs-web.mp4',
      poster: '/videos/2024-Cee-Dees-TDs-poster.jpg'
    },
    {
      key: '2023',
      title: '2023 The Rise of The Comeback Kid',
      src:    'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2023-Comeback-Kid-web.mp4',
      poster: '/videos/2023-Comeback-Kid-poster.jpg'
    },
    {
      key: '2022',
      title: '2022 Perfectly Balanced - I Am Inevitable',
      src:    'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2022-Perfectly-Balanced-web.mp4',
      poster: '/videos/2022-Perfectly-Balanced-poster.jpg'
    }
  ];

  let playing = new Set();

  function start(key) {
    const next = new Set(playing);
    next.add(key);
    playing = next;
  }

  // Nudge playback after user gesture; browsers will allow it
  function tryPlay(e) {
    const v = e.currentTarget;
    v.controls = true;
    const p = v.play?.();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <div class="player">
      {#if playing.has(v.key)}
        <video
          playsinline
          preload="metadata"
          poster={v.poster || ''}
          autoplay
          on:canplay={tryPlay}
          on:loadeddata={tryPlay}
        >
          <source src={v.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      {:else}
        <button
          class="thumb"
          style={`background-image:url('${v.poster || ''}')`}
          on:click={() => start(v.key)}
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
    max-width: 100%;
    margin: 0 auto 3rem;
    padding: 0;
    text-align: center;
    color: var(--g000);
  }

  /* Restored earlier title sizing */
  .title {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 2rem 0;
  }

  /* Full-width, squared edges */
  .player {
    aspect-ratio: 16 / 9;
    width: 100%;
    margin: 0 0 1.5rem;
    border-radius: 0;     /* squared corners */
    overflow: hidden;
    background: #000;
    position: relative;
    box-shadow: none;     /* no shadow, edge-to-edge look */
  }

  .player video {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
    background: #000;
    object-fit: cover;
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
    display: grid;
    place-items: center;
  }

  .thumb:hover .play-icon {
    transform: scale(1.06);
    background: rgba(0,0,0,0.7);
  }
</style>
