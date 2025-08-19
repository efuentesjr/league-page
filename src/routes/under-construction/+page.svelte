<script>
  // nothing needed yet, but keeping the block for future tweaks
  const YT_ID = 'oijBbsTajKs';
  const EMBED = `https://www.youtube.com/embed/${YT_ID}`;
  const WATCH = `https://youtu.be/${YT_ID}`;
</script>

<div class="wrap">
  <h1>🚧 Under Construction 🚧</h1>

  <!-- Responsive 16:9 container -->
  <div class="player">
    <iframe
      src={EMBED}
      title="Under Construction Video"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>

  <!-- Fallback in case the iframe is blocked by the browser/video settings -->
  <a class="fallback" href={WATCH} target="_blank" rel="noopener noreferrer">
    Open on YouTube
  </a>
</div>

<style>
  .wrap {
    max-width: 1100px;
    margin: 2rem auto;
    padding: 0 1rem 3rem;
    text-align: center;
    color: var(--g000);
  }

  h1 {
    margin-bottom: 1.25rem;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  .player {
    position: relative;
    width: 100%;
    max-width: 960px;
    margin: 0 auto 1rem;
    /* 16:9 aspect ratio */
    aspect-ratio: 16 / 9;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    background: #000; /* avoids white flash while loading */
  }

  /* If your build target doesn’t support aspect-ratio, uncomment the classic trick:
  .player { height: 0; padding-bottom: 56.25%; }
  .player iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  */

  .player iframe {
    width: 100%;
    height: 100%;
    display: block;
  }

  .fallback {
    display: inline-block;
    margin-top: .25rem;
    padding: .6rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    color: #fff;
    background: #cc0000;
    box-shadow: 0 4px 12px rgba(0,0,0,.25);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .fallback:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.3); }
</style>

