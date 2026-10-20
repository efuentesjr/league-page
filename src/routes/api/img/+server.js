/*
 * Same-origin pass-through for Sleeper avatars, so the browser is allowed
 * to read their pixels (Sleeper's CDN sends no CORS headers). Used only to
 * pick a team's color from its logo. Locked to sleepercdn.com images.
 */
const ALLOWED_HOST = 'sleepercdn.com';
const ALLOWED_PATHS = ['/avatars/', '/uploads/', '/images/'];

export async function GET({ url, fetch }) {
	let target;
	try {
		target = new URL(url.searchParams.get('u') || '');
	} catch {
		return new Response('bad url', { status: 400 });
	}
	if (
		target.protocol !== 'https:' ||
		target.hostname !== ALLOWED_HOST ||
		!ALLOWED_PATHS.some((p) => target.pathname.startsWith(p))
	) {
		return new Response('not allowed', { status: 403 });
	}

	const res = await fetch(target.href);
	const type = res.headers.get('content-type') || '';
	if (!res.ok || !type.startsWith('image/')) {
		return new Response('not found', { status: 404 });
	}

	return new Response(await res.arrayBuffer(), {
		headers: {
			'content-type': type,
			'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800'
		}
	});
}
