<script>
  // Weekly recap videos hosted on Cloudflare R2
  const RECAPS = [
    {
      key: 'wk1',
      src:  'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/MFL%202025%20Intro.mp4',
      poster: 'https://pub-XXXXXXXX.r2.dev/posters/recap-week-01.jpg'
    },
  ];

  let playing = new Set();

  function start(key) {
    playing = new Set(playing);
    playing.add(key);
  }
</script>

<div class="wrap">
  <h1 class="title">Season Intro</h1>
  <p class="subtitle"></p>

  {#each RECAPS as v}
    <section class="card">
      <header class="card-head">
        <h2 class="card-title">{v.title}</h2>
      </header>

      <div class="player">
        {#if playing.has(v.key)}
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
    border-radius: 0; /* squared edges */
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
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    overflow: hidden;
  }

  .player video {
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
    background-repeat: no-repeat;
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
