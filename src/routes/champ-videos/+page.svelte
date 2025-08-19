<script>
  // Add your video IDs here
  const VIDEOS = [
    { id: "oijBbsTajKs", title: "Championship Video 1" },
    { id: "aglTvcZTmXo",   title: "Championship Video 2" },
    { id: "hdFKFDcJfBk",   title: "Championship Video 3" }
  ];
</script>

<div class="wrap">
  <h1 class="title">🎬 Championship Videos 🎬</h1>

  {#each VIDEOS as v}
    <div class="player">
      <iframe
        src={`https://www.youtube.com/embed/${v.id}`}
        title={v.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>

    <a class="fallback" href={`https://youtu.be/${v.id}`} target="_blank" rel="noopener noreferrer">
      Open {v.title} on YouTube
    </a>
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
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    margin: 1rem 0 2rem;
  }

  .player {
    aspect-ratio: 16 / 9;
    max-width: 960px;
    margin: 0 auto 1rem;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    background: #000;
  }

  .player iframe {
    width: 100%;
    height: 100%;
    display: block;
  }

  .fallback {
    display: inline-block;
    margin-bottom: 2rem;
    padding: .6rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    color: #fff;
    background: #cc0000;
    box-shadow: 0 4px 12px rgba(0,0,0,.25);
  }
  .fallback:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,.3);
  }
</style>

