import { error } from '@sveltejs/kit';

// Allow-list remote hosts you fetch images from
const ALLOW = [
  'sleepercdn.com',
  'r2.dev',                 // Cloudflare R2 default domain
  // 'your.cdn.domain.com', // <-- add your CDN host(s) if needed
];

export async function GET({ url, fetch }) {
  const u = url.searchParams.get('u');
  if (!u) throw error(400, 'Missing ?u=');

  let target;
  try {
    target = new URL(u);
  } catch {
    throw error(400, 'Bad URL');
  }

  if (!ALLOW.some((d) => target.hostname.endsWith(d))) {
    throw error(400, 'Domain not allowed');
  }

  const res = await fetch(target.href);
  if (!res.ok) throw error(res.status, `Upstream ${res.statusText}`);

  const ct = res.headers.get('content-type') || 'image/jpeg';
  const buf = await res.arrayBuffer();

  return new Response(buf, {
    headers: {
      'Content-Type': ct,
      'Cache-Control': 'public, max-age=86400, immutable'
    }
  });
}
