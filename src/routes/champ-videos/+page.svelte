<script>
  // ⬇️ Replace src/poster with your real Cloudflare R2 public URLs
  // Example format: https://pub-XXXXXXXX.r2.dev/2024-Cee-Dees-TDs-web.mp4
  const VIDEOS = [
    {
      key: '2024',
      title: '2024 Cee Dees TDs - The Dynasty Begins',
      src:  'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2024-Cee-Dees-TDs-web.mp4',
      poster: 'https://pub-XXXXXXXX.r2.dev/posters/2024.jpg' // optional
    },
    {
      key: '2023',
      title: '2023 The Rise of The Comeback Kid',
      src:  'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2023-Comeback-Kid-web.mp4',
      poster: 'https://pub-XXXXXXXX.r2.dev/posters/2023.jpg' // optional
    },
    {
      key: '2022',
      title: '2022 Perfectly Balanced - I Am Inevitable',
      src:  'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2022-Perfectly-Balanced-web.mp4',
      poster: 'https://pub-XXXXXXXX.r2.dev/posters/2022.jpg' // optional
    }
  ];

  // track which cards are “playing”
  let playing = new Set();
  const playRefs = new Map(); // key -> <video> element

  function start(key) {
    playing = new Set(playing);
    playing.add(key);
    // wait a tick for the <video> to mount, then play
    queueMicrotask(() => {
      const vid = playRefs.get(key);
      if (vid) {
        // show controls and play
        vid.controls = true;
        const p = vid.play?.();
        // some browsers return a promise; ignore errors from autoplay policies
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    });
  }
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <div class="player">
      {#if playing.has(v.key)}
        <!-- Cloudflare R2 video -->
        <video
          bind:this={(el) => playRefs.set(v.key, el)}
          playsinline
          preload="metadata"
          poster={v.poster || ''}
        >
          <source src={v.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      {:else}
        <!-- Poster with title overlay + play button -->
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

  .player video, .player iframe {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
    background: #000;
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

  .thumb:hover .play-icon { transform: scale(1.06); background: rgba(0,0,0,0.7); }
</style>
