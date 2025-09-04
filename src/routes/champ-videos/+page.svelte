<script>
  // Replace with your real Cloudflare R2 public URLs
  const VIDEOS = [
    {
      key: '2024',
      title: '2024 Cee Dees TDs - The Dynasty Begins',
      src:  'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2024-Cee-Dees-TDs-web.mp4',
      poster: '/videos/2024-Cee-Dees-TDs-poster.jpg'
    },
    {
      key: '2023',
      title: '2023 The Rise of The Comeback Kid',
      src:  'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2023-Comeback-Kid-web.mp4',
      poster: '/videos/2023-Comeback-Kid-poster.jpg'
    },
    {
      key: '2022',
      title: '2022 Perfectly Balanced - I Am Inevitable',
      src:  'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2022-Perfectly-Balanced-web.mp4',
      poster: '/videos/2022-Perfectly-Balanced-poster.jpg'
    }
  ];

  let playing = new Set();

  function start(key) {
    const next = new Set(playing);
    next.add(key);
    playing = next;
  }
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <div class="player">
      {#if playing.has(v.key)}
        <video
          controls
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
    max-width: 100%;
    margin: 0 auto 1.5rem;
    border-radius: 0;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    background: #000;
    position: relative;
  }

  .player video {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
    background: #000;
  }

  /* Posters fill container by default (keeps mobile/app look) */
  .thumb {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    cursor: pointer;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
  }

  /* Desktop tweak: scale posters down to fit nicely */
  @media (min-width: 1024px) {
    .thumb {
      background-size: contain;   /* shrink inside player box */
      background-color: #000;     /* letterbox gaps */
    }
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
