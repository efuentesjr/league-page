<script>
  import { onMount, onDestroy } from 'svelte';

  // Championship films (Cloudflare R2). Newest first; the first one is featured.
  const VIDEOS = [
    {
      key: '2025',
      year: 2025,
      champ: "The People's Champ",
      tagline: 'The Mark of A Fighter',
      src: 'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/PC2026.mp4',
      poster: '/videos/2025-Peoples-Champ-poster.jpg'
    },
    {
      key: '2024',
      year: 2024,
      champ: 'CeeDees TDs',
      tagline: 'The Dynasty Begins',
      src: 'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2024-Cee-Dees-TDs-web.mp4',
      poster: '/videos/2024-Cee-Dees-TDs-poster.jpg'
    },
    {
      key: '2023',
      year: 2023,
      champ: 'The Comeback Kid',
      tagline: 'The Rise of The Comeback Kid',
      src: 'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2023-Comeback-Kid-web.mp4',
      poster: '/videos/2023-Comeback-Kid-poster.jpg'
    },
    {
      key: '2022',
      year: 2022,
      champ: 'Perfectly Balanced',
      tagline: 'I Am Inevitable',
      src: 'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2022-Perfectly-Balanced-web.mp4',
      poster: '/videos/2022-Perfectly-Balanced-poster.jpg'
    }
  ];

  const featured = VIDEOS[0];
  const archive = VIDEOS.slice(1);

  let playing = new Set();
  const start = (v, ev) => {
    playing = new Set(playing).add(v.key);
    burst(ev);
  };

  /* ---------- confetti (canvas, no library) ---------- */
  let canvas;
  let pieces = [];
  let raf = null;
  let reduceMotion = false;
  const COLORS = ['#ffd84d', '#f5d56b', '#fff3c4', '#38e8ff', '#ffffff', '#c9962c'];

  const spawn = (x, y, count, spread = 1) => {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * spread;
      const speed = 6 + Math.random() * 9;
      pieces.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 140 + Math.random() * 60
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const tick = () => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) { raf = null; return; }
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== innerWidth * dpr || canvas.height !== innerHeight * dpr) {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pieces = pieces.filter((p) => p.life > 0 && p.y < innerHeight + 40);
    for (const p of pieces) {
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      ctx.restore();
    }
    raf = pieces.length ? requestAnimationFrame(tick) : null;
  };

  const burst = (ev) => {
    if (reduceMotion) return;
    const x = ev?.clientX ?? innerWidth / 2;
    const y = ev?.clientY ?? innerHeight / 2;
    spawn(x, y, 90, 0.9);
  };

  onMount(() => {
    reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      // opening celebration from both top corners
      setTimeout(() => {
        spawn(innerWidth * 0.1, innerHeight * 0.35, 70, 0.6);
        spawn(innerWidth * 0.9, innerHeight * 0.35, 70, 0.6);
      }, 350);
    }
  });

  onDestroy(() => raf && cancelAnimationFrame(raf));
</script>

<svelte:head>
  <title>Championship Videos</title>
</svelte:head>

<canvas class="confetti" bind:this={canvas} aria-hidden="true"></canvas>

<div class="wrap">
  <!-- HERO -->
  <header class="hero">
    <span class="rays" aria-hidden="true"></span>
    <div class="heroInner">
      <div class="kicker">MFFL Hall of Champions</div>
      <h1>Championship Videos</h1>
      <p class="sub">Every title, on film. Press play and relive the run.</p>
      <div class="banners" aria-label="Champions by year">
        {#each VIDEOS as v}
          <a class="banner" href={`#film-${v.key}`}>
            <span class="bYear">{v.year}</span>
            <span class="bName">{v.champ}</span>
          </a>
        {/each}
      </div>
    </div>
  </header>

  <!-- FEATURED: reigning champion -->
  <section class="featured" id={`film-${featured.key}`}>
    <div class="featHead">
      <div class="ribbon">Reigning Champion</div>
      <div class="featTitle">
        <span class="featYear">{featured.year}</span>
        <span class="featChamp">{featured.champ}</span>
      </div>
      <div class="featTag">“{featured.tagline}”</div>
    </div>
    <div class="frame gold">
      {#if playing.has(featured.key)}
        <video controls autoplay playsinline preload="metadata" poster={featured.poster}>
          <source src={featured.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      {:else}
        <button class="thumb" style={`background-image:url('${featured.poster}')`} onclick={(e) => start(featured, e)} aria-label={`Play ${featured.year} ${featured.champ}: ${featured.tagline}`}>
          <span class="play"><span class="tri"></span></span>
        </button>
      {/if}
    </div>
  </section>

  <!-- ARCHIVE -->
  <div class="sectionHead">
    <h2>The Title Reel</h2>
    <span>{VIDEOS.length} champions crowned</span>
  </div>
  <div class="grid">
    {#each archive as v}
      <article class="card" id={`film-${v.key}`}>
        <div class="frame">
          {#if playing.has(v.key)}
            <video controls autoplay playsinline preload="metadata" poster={v.poster}>
              <source src={v.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          {:else}
            <button class="thumb" style={`background-image:url('${v.poster}')`} onclick={(e) => start(v, e)} aria-label={`Play ${v.year} ${v.champ}: ${v.tagline}`}>
              <span class="play small"><span class="tri"></span></span>
            </button>
          {/if}
        </div>
        <div class="cardInfo">
          <span class="cardYear">{v.year}</span>
          <div class="cardText">
            <span class="cardChamp">{v.champ}</span>
            <span class="cardTag">“{v.tagline}”</span>
          </div>
          <img class="cardTrophy" src="/awards/champion.png" alt="" />
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  .confetti {
    position: fixed;
    inset: 0;
    z-index: 50;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }

  .wrap {
    --gold: #f5d56b;
    --gold-hi: #fff3c4;
    --gold-lo: #c9962c;
    --gold-glow: rgba(255, 210, 60, 0.45);
    position: relative;
    z-index: 1;
    width: 96%;
    max-width: 1150px;
    margin: 0 auto;
    padding: 22px 0 60px;
    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    color: var(--mf-text);
  }

  /* ---------- hero ---------- */
  .hero {
    position: relative;
    overflow: hidden;
    padding: 34px 20px 26px;
    text-align: center;
    background:
      radial-gradient(ellipse at 50% 120%, rgba(255, 215, 0, 0.28), transparent 60%),
      radial-gradient(ellipse at 50% -30%, rgba(56, 232, 255, 0.12), transparent 60%),
      linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
      var(--mf-bg);
    border: 1px solid color-mix(in srgb, var(--gold) 45%, var(--mf-line));
    border-top: 3px solid var(--gold);
    clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
  }

  .rays {
    position: absolute;
    left: 50%;
    bottom: -420px;
    width: 900px;
    height: 900px;
    margin-left: -450px;
    border-radius: 50%;
    background: repeating-conic-gradient(rgba(255, 215, 0, 0.1) 0deg 6deg, transparent 6deg 18deg);
    -webkit-mask: radial-gradient(circle, #000 20%, transparent 65%);
    mask: radial-gradient(circle, #000 20%, transparent 65%);
    animation: spin 40s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .heroInner {
    position: relative;
  }

  .kicker {
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--gold);
  }

  h1 {
    margin: 8px 0 6px;
    font-size: clamp(2rem, 5.5vw, 3.4rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: 0.02em;
    background: linear-gradient(180deg, #fffbe8, var(--gold) 55%, var(--gold-lo));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 18px var(--gold-glow));
  }

  .sub {
    margin: 0 0 18px;
    font-family: 'Roboto', sans-serif;
    font-size: 0.95rem;
    color: var(--mf-dim);
  }

  .banners {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* hanging championship banners */
  .banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 116px;
    padding: 10px 12px 18px;
    text-decoration: none;
    color: inherit;
    background: linear-gradient(180deg, #1c1706, #0b0f1c);
    border: 1px solid color-mix(in srgb, var(--gold) 55%, transparent);
    border-top: 3px solid var(--gold);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%);
    transition: transform 0.2s ease;
  }

  .banner:hover {
    transform: translateY(-3px);
  }

  .bYear {
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(180deg, #fffbe8, var(--gold) 55%, var(--gold-lo));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .bName {
    margin-top: 4px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--mf-text);
  }

  /* ---------- featured ---------- */
  .featured {
    margin-top: 24px;
    scroll-margin-top: 20px;
  }

  .featHead {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 16px;
    margin-bottom: 12px;
  }

  .ribbon {
    padding: 5px 14px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #1a1203;
    background: linear-gradient(180deg, var(--gold-hi), var(--gold) 60%, var(--gold-lo));
    box-shadow: 0 0 18px -4px var(--gold-glow);
    clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%, 10px 50%);
    padding-inline: 20px;
  }

  .featTitle {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .featYear {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(180deg, #fffbe8, var(--gold) 55%, var(--gold-lo));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .featChamp {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .featTag {
    font-family: 'Roboto', sans-serif;
    font-style: italic;
    color: var(--mf-dim);
  }

  /* ---------- video frames ---------- */
  .frame {
    position: relative;
    aspect-ratio: 16 / 9;
    max-width: 100%;
    overflow: hidden;
    background: #000;
    border: 1px solid var(--mf-line-strong);
    box-shadow: 0 0 30px -10px var(--mf-ion-glow);
  }

  .frame.gold {
    border: 2px solid var(--gold);
    box-shadow:
      0 0 0 6px color-mix(in srgb, var(--gold) 14%, transparent),
      0 0 50px -8px var(--gold-glow);
  }

  .frame video {
    display: block;
    width: 100%;
    height: 100%;
    background: #000;
  }

  .thumb {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    cursor: pointer;
    background-color: #000;
    background-size: cover;
    background-position: center;
  }

  @media (min-width: 1024px) {
    .frame.gold .thumb {
      background-size: contain;
    }
  }

  .thumb::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.55));
    transition: opacity 0.2s;
  }

  .thumb:hover::after {
    opacity: 0.4;
  }

  .play {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 92px;
    height: 92px;
    margin: -46px 0 0 -46px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, var(--gold-hi), var(--gold) 50%, var(--gold-lo));
    box-shadow: 0 0 0 8px rgba(245, 213, 107, 0.2), 0 0 40px var(--gold-glow);
    transition: transform 0.2s ease;
    animation: pulse 2.4s ease-in-out infinite;
  }

  .play.small {
    width: 64px;
    height: 64px;
    margin: -32px 0 0 -32px;
  }

  .thumb:hover .play {
    transform: scale(1.08);
  }

  .tri {
    width: 0;
    height: 0;
    margin-left: 6px;
    border-top: 16px solid transparent;
    border-bottom: 16px solid transparent;
    border-left: 26px solid #1a1203;
  }

  .play.small .tri {
    margin-left: 4px;
    border-top-width: 11px;
    border-bottom-width: 11px;
    border-left-width: 18px;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 8px rgba(245, 213, 107, 0.2), 0 0 30px var(--gold-glow); }
    50% { box-shadow: 0 0 0 14px rgba(245, 213, 107, 0.08), 0 0 55px var(--gold-glow); }
  }

  /* ---------- archive ---------- */
  .sectionHead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin: 34px 2px 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 35%, var(--mf-line));
  }

  .sectionHead h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gold);
    text-shadow: 0 0 16px var(--gold-glow);
  }

  .sectionHead span {
    font-size: 0.82rem;
    color: var(--mf-dim);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 16px;
  }

  .card {
    scroll-margin-top: 20px;
    background:
      radial-gradient(ellipse at 50% 120%, rgba(245, 213, 107, 0.12), transparent 60%),
      var(--mf-panel);
    border: 1px solid color-mix(in srgb, var(--gold) 35%, var(--mf-line));
    border-top: 2px solid var(--gold);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 34px -18px var(--gold-glow);
  }

  .card .frame {
    border: 0;
    box-shadow: none;
  }

  .cardInfo {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
  }

  .cardYear {
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(180deg, #fffbe8, var(--gold) 55%, var(--gold-lo));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .cardText {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .cardChamp {
    font-size: 1rem;
    font-weight: 700;
  }

  .cardTag {
    font-family: 'Roboto', sans-serif;
    font-size: 0.8rem;
    font-style: italic;
    color: var(--mf-dim);
  }

  .cardTrophy {
    width: 38px;
    height: 38px;
    object-fit: contain;
    border-radius: 50%;
    filter: drop-shadow(0 0 8px var(--gold-glow));
  }

  @media (max-width: 560px) {
    .hero {
      padding: 26px 12px 20px;
    }
    .banner {
      min-width: 0;
      flex: 1 1 40%;
    }
    .featYear {
      font-size: 1.6rem;
    }
    .featChamp {
      font-size: 1.2rem;
    }
    .play {
      width: 70px;
      height: 70px;
      margin: -35px 0 0 -35px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rays,
    .play {
      animation: none;
    }
  }
</style>
