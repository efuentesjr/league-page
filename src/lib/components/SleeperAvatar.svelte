<script>
  import { managers } from '$static/playoffs-projection';

  export let slug = '';
  export let size = 28;
  export let alt = 'avatar';
  export let avatarFromStore = null; // users[managerID]?.avatar if you have it

  const mgr = (Array.isArray(managers) ? managers.find(m => m.slug === slug) : null) || {};
  const FALLBACK_GLOBAL = '/images/mffl-avatar-fallback.png'; // optional global logo
  const FALLBACK_BY_SLUG = slug ? `/playoffs-projection/${slug}.png` : null; // <- your folder

  function toAvatarUrl(v) {
    if (!v) return null;
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
    return `https://sleepercdn.com/avatars/thumbs/${v}`; // treat as Sleeper avatar id
  }

  // Try in this order
  let attempts = [
    toAvatarUrl(avatarFromStore), // Sleeper avatar (URL or id)
    mgr.photo || null,            // your per-manager photo (if set)
    FALLBACK_BY_SLUG,             // your slug PNG in static/playoffs-projection
    FALLBACK_GLOBAL               // optional global fallback
  ].filter(Boolean);

  let i = 0;
  $: src = attempts[i];

  const initials = (mgr.name || slug || '?')
    .split(/\s+/).map(s => s[0]?.toUpperCase()).slice(0,2).join('') || '?';
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
        i += 1; // try next candidate
      } else {
        // swap to initials bubble
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
