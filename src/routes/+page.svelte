<script>
  // keep your other imports/state above

  const HERO_VIDEO = {
    src: 'https://pub-0888a19df3f14ac9b6edcc4f6f3a9547.r2.dev/MFFL%20WK.mp4',
    poster: 'static/videos/LOGO1.jpg'
  };

  import { onMount } from 'svelte';
  let prefersReducedMotion = false;
  onMount(() => {
    prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  let heroEl;
  let heroAspect = '16 / 9'; // fallback before metadata loads

  function onLoadedMetadata() {
    if (!heroEl) return;
    const w = heroEl.videoWidth || 16;
    const h = heroEl.videoHeight || 9;
    heroAspect = `${w} / ${h}`; // e.g., "1920 / 1080" or "1080 / 1920"
  }
</script>

<style>
  :global(html, body) { overflow-x: hidden; }

  .hero-video {
    position: relative;
    width: 100vw;
    /* We’ll set aspect-ratio inline from Svelte so it matches the source */
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
    /* Use contain to avoid any cropping or distortion. Letterboxes as needed. */
    object-fit: contain;
    background: #000; /* keeps black bars clean */
  }
</style>

<!-- ===== Hero video block (native controls, true aspect) ===== -->
<div class="hero-video" style="aspect-ratio: {heroAspect}">
  {#if !prefersReducedMotion}
    <video
      bind:this={heroEl}
      autoplay
      muted
      loop
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
  {:else}
    <img src={HERO_VIDEO.poster} alt="Season intro" />
  {/if}
</div>
