<script>
  import { managers } from '$lib/utils/leagueInfo';

  export let slug = '';
  export let size = 28;
  export let alt = 'avatar';
  // If you already fetch Sleeper users, pass their avatar id/url here
  export let avatarFromStore = null;

  const mgr = (Array.isArray(managers) ? managers.find(m => m.slug === slug) : null) || {};

  // Build a Sleeper avatar URL if given just an id
  function toAvatarUrl(v) {
    if (!v) return null;
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
    return `https://sleepercdn.com/avatars/thumbs/${v}`;
  }

  // 1) Sleeper → 2) static/playoffs-projection/<slug>.* → 3) manager.photo → 4) global → 5) initials
  const FALLBACK_GLOBAL = '/images/mffl-avatar-fallback.png'; // keep or remove if you don't want it
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg'];

  // Build candidate URLs in priority order (no hardcoded extension)
  let attempts = [
    toAvatarUrl(avatarFromStore),                                   // Sleeper avatar (URL or id)
    ...exts.map(ext => `/playoffs-projection/${slug}.${ext}`),      // your uploaded files in static/
    mgr.photo || null,                                              // manager.photo as last-resort local
    FALLBACK_GLOBAL                                                 // optional global fallback
  ].filter(Boolean);

  let i = 0;
  $: src = attempts[i];

  const initials =
    (mgr.name || slug || '?')
      .split(/\s+/)
      .map(s => s[0]?.toUpperCase())
      .slice(0, 2)
      .join('') || '?';
</script>

{#if src}
  <img
    src={src}
    alt={alt}
    width={size}
    height={size}
    loading="lazy"
    referrerpolicy="no-referrer"
    style="border-radius:50%; object-fit:cover;"
    on:error={() => {
      if (i < attempts.length - 1) {
        i += 1; // try next candidate (cycles through all your static files/extensions)
      } else {
        // everything failed → swap to initials bubble
        const node = document.createElement('div');
        node.setAttribute('aria-label', alt);
        node.setAttribute('style', `
          width:${size}px;height:${size}px;border-radius:50%;
          display:inline-flex;align-items:center;justify-content:center;
          background:#2b2f36;color:#cfd6e4;font-weight:700;
          font-size:${Math.max(10, size*0.42)}px;
        `);
        node.textContent = initials;
        const img = event.currentTarget;
        img.replaceWith(node);
      }
    }}
  />
{/if}
