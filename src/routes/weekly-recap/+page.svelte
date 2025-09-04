<script>
  // Weekly recap items — mix YouTube and Cloudflare R2 freely.
  // - For YouTube, set { ytId: "VIDEO_ID", title, poster? }
  // - For R2/local MP4, set { src: "https://...mp4", title, poster? }
  const RECAPS = [
    // Example: Cloudflare R2 (replace with your public R2 URLs)
    {
      key: 'wk1',
      title: 'Week 1 Recap — Statement Wins & Surprise Lows',
      src:  'https://pub-XXXXXXXX.r2.dev/recap-week-01.mp4',
      poster: 'https://pub-XXXXXXXX.r2.dev/posters/recap-week-01.jpg'
    },
    // Example: YouTube fallback (optional)
    {
      key: 'wk2',
      title: 'Week 2 Recap — Shootouts & Heartbreakers',
      ytId: 'oijBbsTajKs',
      // Optional custom poster; otherwise we’ll auto-pull from YouTube
      // poster: 'https://your-cdn/posters/recap-week-02.jpg'
    },
    // Another R2 example
    {
      key: 'wk3',
      title: 'Week 3 Recap — Power Shift at the Top',
      src:  'https://pub-XXXXXXXX.r2.dev/recap-week-03.mp4',
      poster: 'https://pub-XXXXXXXX.r2.dev/posters/recap-week-03.jpg'
    }
  ];

  // Which card is “playing” (key set)
  let playing = new Set();

  // Build a YT thumbnail if none provided
  const ytThumb = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  function start(key) {
    // toggle card into “playing” state
    playing = new Set(playing);
    playing.add(key);
  }
</script>

<div class="wrap">
  <h1 class="title">Weekly Recap</h1>
  <p class="subtitle">Fast highlights, big swings, and who’s hot/not this week.</p>

  {#each RECAPS as v}
    <section class="card">
      <header class="card-head">
        <h2 class="card-title">{v.title}</h2>
      </header>

      <div class="player">
        {#if playing.has(v.key)}
          {#if v.src}
            <!-- Cloudflare R2 / MP4 -->
            <video
              playsinline
              controls
              autoplay
              preload="metadata"
              poster={v.poster || ''}
            >
              <source src={v.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          {:else if v.ytId}
            <!-- YouTube -->
            <iframe
              src={`https://www.youtube.com/embed/${v.ytId}?autoplay=1&rel=0`}
              title={v.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          {/if}
        {:else}
          <!-- Poster with title overlay + play button -->
          <button
            class="thumb"
            style={`background-image:url('${v.poster || (v.ytId ? ytThumb(v.ytId) : '')}')`}
            on:click={() => start(v.key)}
            aria-label={`Play ${v.title}`}
          >
            <div class="overlay-title">{v.title}</div>
            <span class="play-icon">▶</span>
          </button>
        {/if}
      </div>
    </section>
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
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0 0 .25rem;
    text-align: center;
  }
  .subtitle {
    text-align: center;
    opacity: .85;
    margin: 0 0 1.25rem;
    font-size: .95rem;
  }

  .card {
    margin: 0 auto 1.75rem;
    /* squared edges by request */
    border-radius: 0;
    background: var(--fff);
    box-shadow: 0 8px 28px rgba(0,0,0,.16);
  }
  .card-head {
    padding: .75rem 1rem;
    border-bottom: 1px solid rgba(0,0,0,.08);
  }
  .card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .player {
    /* Full-bleed video area with squared corners */
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    overflow: hidden;
  }

  /* Fill container; square corners (no border-radius) */
  .player video,
  .player iframe {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
    background: #000;
  }

  /* Poster (click-to-play) */
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

  /* Desktop: keep posters from “overfilling” and looking oversized */
  @media (min-width: 1024px) {
    .thumb {
      background-size: contain;   /* show entire poster nicely */
      background-color: #000;     /* letterbox fill */
    }
  }

  .overlay-title {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    font-size: .95rem;
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

  /* Tighten card on very small screens */
  @media (max-width: 480px) {
    .card-title { font-size: .95rem; }
    .overlay-title { font-size: .9rem; }
  }
</style>
