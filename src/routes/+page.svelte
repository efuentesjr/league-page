<script>
  import { PUBLIC_PROJECTIONS_URL } from '$env/static/public';
  console.log("Projections URL:", PUBLIC_PROJECTIONS_URL);

  import LinearProgress from '@smui/linear-progress';
  import {
    getNflState,
    leagueName,
    getAwards,
    getLeagueTeamManagers,
    homepageText,
    managers,
    gotoManager,
    enableBlog,
    waitForAll
  } from '$lib/utils/helper';
  import { Transactions, PowerRankings, HomePost } from '$lib/components';
  import {
    getAvatarFromTeamManagers,
    getTeamFromTeamManagers
  } from '$lib/utils/helperFunctions/universalFunctions';
  import { onMount } from 'svelte';

  // Data loads
  const nflState = getNflState();
  const podiumsData = getAwards();
  const leagueTeamManagersData = getLeagueTeamManagers();

  // ===== Hero video (Cloudflare R2) =====
  const HERO_VIDEO = {
    // src: 'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/2025.mp4',
  };

  // Accessibility: detect reduced motion
  let prefersReducedMotion = false;
  onMount(() => {
    prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  // Dynamic aspect ratio
  let heroEl;
  let heroAspect = '16 / 9';

  function onLoadedMetadata() {
    if (!heroEl) return;
    const w = heroEl.videoWidth || 16;
    const h = heroEl.videoHeight || 9;
    heroAspect = `${w} / ${h}`;
  }
</script>

<style>
  :global(html, body) {
    overflow-x: hidden;
  }

  /* ===== Hero video (dynamic aspect) ===== */
  .hero-video {
    position: relative;
    width: 100vw;
    background: #000;
    overflow: hidden;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
  }

  .hero-video video,
  .hero-video img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    background: #000;
  }

  /* ===== Existing layout ===== */
  #home {
    display: flex;
    flex-wrap: nowrap;
    position: relative;
    overflow-y: hidden;
    z-index: 1;
  }

  #main {
    flex-grow: 1;
    min-width: 320px;
    margin: 0 auto;
    padding: 10px 0;
  }

  .text {
    padding: 0 30px;
    max-width: 620px;
    margin: 0 auto;
  }

  .leagueData {
    position: relative;
    z-index: 1;
    width: 100%;
    min-width: 470px;
    max-width: 470px;
    min-height: 100%;
    background-color: var(--ebebeb);
    border-left: var(--eee);
    box-shadow: inset 8px 0px 6px -6px rgb(0 0 0 / 24%);
  }

  @media (max-width: 950px) {
    .leagueData {
      max-width: 100%;
      min-width: 100%;
      width: 100%;
      box-shadow: none;
    }

    #home {
      flex-wrap: wrap;
    }
  }

  .transactions {
    display: block;
    width: 95%;
    margin: 10px auto;
  }

  .center {
    text-align: center;
  }

  h6 {
    text-align: center;
  }

  .homeBanner {
    background-color: var(--blueOne);
    color: #fff;
    padding: 0.5em 0;
    font-weight: 500;
    font-size: 1.5em;
  }

  /* ===== Current Champion ===== */
  #currentChamp {
    padding: 25px 0;
    background-color: var(--f3f3f3);
    box-shadow: 5px 0 8px var(--champShadow);
    border-left: 1px solid var(--ddd);
  }

  #champ {
    position: relative;
    width: 150px;
    height: 150px;
    margin: 0 auto;
    cursor: pointer;
  }

  .first {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border-radius: 100%;
    border: 1px solid #ccc;
    left: 50%;
    top: 43%;
  }

  .laurel {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 135px;
    height: auto;
    left: 50%;
    top: 50%;
  }

  h4 {
    text-align: center;
    font-size: 2em;
    font-weight: bold;
    font-family: 'Arial', sans-serif;
    color: #0047ab;
    text-transform: uppercase;
  }

  .label {
    display: table;
    text-align: center;
    line-height: 1.1em;
    font-size: 1.7em;
    margin: 6px auto 10px;
    cursor: pointer;
  }

  :global(.curOwner) {
    font-size: 0.75em;
    color: #bbb;
    font-style: italic;
  }

  /* ===== The Beat Shortcut: "league pulse" banner ===== */
  .the-beat-link {
    --void: var(--mf-bg);
    --ion: var(--mf-ion);
    --plasma: var(--mf-plasma);
    --signal: var(--mf-text);
    --dim: var(--mf-dim);

    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 22px;

    container-type: inline-size;

    width: 100%;
    max-width: 960px;
    margin: 8px auto 40px;
    padding: 22px 28px;
    box-sizing: border-box;
    overflow: hidden;

    font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    color: var(--signal);
    text-decoration: none;

    background:
      radial-gradient(ellipse at 30% 50%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
      radial-gradient(ellipse at 80% 50%, color-mix(in srgb, var(--mf-ion) 14%, transparent), transparent 55%),
      var(--void);
    border: 1px solid var(--mf-line-strong);
    clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
    transition: border-color 0.2s ease;
  }

  .the-beat-link:hover,
  .the-beat-link:focus-visible {
    border-color: var(--ion);
    outline: none;
  }

  .the-beat-link:focus-visible {
    box-shadow: inset 0 0 0 2px var(--ion);
  }

  /* the heartbeat trace that runs behind the wordmark */
  .beat-pulse {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .beat-pulse .trace-base {
    fill: none;
    stroke: var(--mf-line);
    stroke-width: 2;
  }

  .beat-pulse .trace {
    fill: none;
    stroke: var(--ion);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 220 1400;
    filter: drop-shadow(0 0 6px var(--ion));
    animation: beatTrace 3.2s linear infinite;
  }

  @keyframes beatTrace {
    from { stroke-dashoffset: 220; }
    to { stroke-dashoffset: -1400; }
  }

  .beat-badge {
    position: relative;
    width: 76px;
    height: auto;
    filter: drop-shadow(0 0 12px var(--mf-line-strong));
  }

  .beat-title {
    position: relative;
    flex: 1 1 220px;
    min-width: 0;
  }

  .beat-wordmark {
    display: block;
    font-size: clamp(2.2rem, 9cqi, 4.6rem);
    white-space: nowrap;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: 0.01em;
    color: var(--signal);
    text-shadow:
      0 0 14px var(--mf-ion-glow),
      0 0 38px color-mix(in srgb, var(--mf-plasma) 22%, transparent);
  }

  .beat-tagline {
    display: block;
    margin-top: 6px;
    font-size: 1rem;
    font-weight: 500;
    color: var(--dim);
  }

  .beat-open {
    position: relative;
    flex: none;
    margin-left: auto;
    padding: 9px 16px;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--mf-on-ion);
    background: var(--ion);
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    transition: background-color 0.2s ease;
  }

  .the-beat-link:hover .beat-open {
    background: color-mix(in srgb, var(--ion) 75%, white);
  }

  @media (prefers-reduced-motion: reduce) {
    .beat-pulse .trace {
      animation: none;
      stroke-dasharray: none;
      opacity: 0.5;
    }
  }

  /* ===== Narrow ===== */
  @container (max-width: 520px) {
    .beat-badge {
      width: 52px;
    }

    .beat-tagline {
      font-size: 0.85rem;
    }

    .beat-open {
      flex: 1 1 100%;
      text-align: center;
    }
  }

  @media (max-width: 700px) {
    .the-beat-link {
      width: 96%;
      padding: 16px;
      margin: 6px auto 30px;
      clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    }
  }
</style>

<!-- ===== Hero video block ===== -->
{#if HERO_VIDEO.src || HERO_VIDEO.poster}
  <div class="hero-video" style="aspect-ratio: {heroAspect}">
    {#if HERO_VIDEO.src && !prefersReducedMotion}
      <video
        bind:this={heroEl}
        muted
        playsinline
        controls
        preload="metadata"
        poster={HERO_VIDEO.poster}
        src={HERO_VIDEO.src}
        on:loadedmetadata={onLoadedMetadata}
      >
        <source src={HERO_VIDEO.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    {:else if HERO_VIDEO.poster}
      <img src={HERO_VIDEO.poster} alt="Season intro" />
    {/if}
  </div>
{/if}

<div id="home">
  <div id="main">
    <div class="text">
      <h4>{leagueName}</h4>

      {@html homepageText}

      {#if enableBlog}
        <HomePost />
      {/if}
    </div>

    <!-- ===== The Beat Shortcut ===== -->
    <a
      class="the-beat-link"
      href="https://jdiazdecaro.github.io/MFFL/beat.html"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="The Beat: MFFL league pulse (opens in a new tab)"
    >
      <svg class="beat-pulse" viewBox="0 0 960 160" preserveAspectRatio="none" aria-hidden="true">
        <polyline class="trace-base" points="0,80 600,80 622,80 636,56 650,104 666,18 684,142 700,80 730,80 742,66 754,94 766,80 960,80" />
        <polyline class="trace" points="0,80 600,80 622,80 636,56 650,104 666,18 684,142 700,80 730,80 742,66 754,94 766,80 960,80" />
      </svg>

      <img class="beat-badge" src="/badge.png" alt="" />

      <span class="beat-title">
        <span class="beat-wordmark">The Beat</span>
        <span class="beat-tagline">The MFFL league pulse</span>
      </span>

      <span class="beat-open">Read The Beat</span>
    </a>

    <PowerRankings />
  </div>

  <div class="leagueData">
    <div class="homeBanner">
      {#await nflState}
        <div class="center">Retrieving NFL state...</div>
        <LinearProgress indeterminate />
      {:then nflStateData}
        <div class="center">
          NFL {nflStateData.season}

          {#if nflStateData.season_type == 'pre'}
            Preseason
          {:else if nflStateData.season_type == 'post'}
            Postseason
          {:else}
            Season - {nflStateData.week > 0 ? `Week ${nflStateData.week}` : 'Preseason'}
          {/if}
        </div>
      {:catch error}
        <div class="center">
          Something went wrong: {error.message}
        </div>
      {/await}
    </div>

    <div id="currentChamp">
      {#await waitForAll(podiumsData, leagueTeamManagersData)}
        <p class="center">Retrieving awards...</p>
        <LinearProgress indeterminate />
      {:then [podiums, leagueTeamManagers]}
        {#if podiums[0]}
          <h4>{podiums[0].year} Fantasy Champ</h4>

          <div
            id="champ"
            on:click={() => {
              if (managers.length)
                gotoManager({
                  year: podiums[0].year,
                  leagueTeamManagers,
                  rosterID: parseInt(podiums[0].champion)
                });
            }}
          >
            <img
              src="{getAvatarFromTeamManagers(
                leagueTeamManagers,
                podiums[0].champion,
                podiums[0].year
              )}"
              class="first"
              alt="champion"
            />

            <img
              src="/laurel.png"
              class="laurel"
              alt="laurel"
            />
          </div>

          <span
            class="label"
            on:click={() =>
              gotoManager({
                year: podiums[0].year,
                leagueTeamManagers,
                rosterID: parseInt(podiums[0].champion)
              })}
          >
            {getTeamFromTeamManagers(
              leagueTeamManagers,
              podiums[0].champion,
              podiums[0].year
            ).name}
          </span>
        {:else}
          <p class="center">No former champs.</p>
        {/if}
      {:catch error}
        <p class="center">
          Something went wrong: {error.message}
        </p>
      {/await}
    </div>

    <div class="transactions">
      <Transactions />
    </div>
  </div>
</div>
