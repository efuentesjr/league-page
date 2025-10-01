<script>
  // Weekly recap videos hosted on Cloudflare R2
  const RECAPS = [
    {
      key: 'wk1',
      // ⬇️ your NEW video URL goes here
      src: 'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/0929.mp4',
      poster: '/videos/LOGO1.jpg'
    }
  ];

  // Add a cache-buster so CDN can't serve an old file
  const RECAPS_WITH_CACHEBUST = RECAPS.map(v => ({
    ...v,
    src: v.src + (v.src.includes('?') ? '&' : '?') + 'v=' + Date.now()
  }));

  // Debug: print the URL actually used at runtime
  console.log('[WeeklyRecap] video src ->', RECAPS_WITH_CACHEBUST[0].src);
</script>

<div class="wrap">
  <h1 class="title">Season Intro</h1>

  <!-- Debug: show the URL on the page so we can confirm the build is current -->
  <p style="font-size:0.9rem;opacity:.8;word-break:break-all;margin:0 1rem 1rem;">
    Using video: <code>{RECAPS_WITH_CACHEBUST[0].src}</code>
  </p>

  {#each RECAPS_WITH_CACHEBUST as v}
    <section class="card">
      <div class="player">
        <video
          autoplay
          muted
          playsinline
          controls
          preload="metadata"
          poster={v.poster || ''}
        >
          <source src={v.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  {/each}
</div>

<style>
  .wrap {
    margin: 0;
    padding: 0;
    color: var(--g000);
    text-align: center;
  }

  .title {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 1rem 0;
  }

  .card {
    margin: 0;
    border-radius: 0;
    background: #000;
  }

  .player {
    width: 100vw;       /* full width */
    max-width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    overflow: hidden;
  }

  .player video {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
    object-fit: cover; /* fill horizontally */
  }
</style>
