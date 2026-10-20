/*
 * ============================================================
 * LOGO COLOR
 * ============================================================
 * Picks the main color out of a team's Sleeper avatar so cards can
 * wear the team's own color. Runs in the browser on a 32×32 copy of
 * the image (loaded through /api/img so the pixels are readable).
 *
 * - Ignores near-white, near-black and gray pixels
 * - Groups the rest by hue and takes the strongest group
 * - Nudges the result bright enough to read on the dark theme
 * - Returns null for black/white/gray logos (caller falls back)
 *
 * Results are remembered on the device, so each logo is read once.
 */
import { browser } from '$app/environment';

const STORE_KEY = 'mfflLogoColor_v1';
const memo = new Map();
let saved = null;

const loadSaved = () => {
	if (saved) return saved;
	saved = {};
	try {
		saved = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
	} catch {
		saved = {};
	}
	return saved;
};

const persist = (src, color) => {
	try {
		const s = loadSaved();
		s[src] = color;
		localStorage.setItem(STORE_KEY, JSON.stringify(s));
	} catch {
		// storage blocked: we'll just recompute next visit
	}
};

const rgbToHsl = (r, g, b) => {
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h;
	if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
	else if (max === g) h = (b - r) / d + 2;
	else h = (r - g) / d + 4;
	return [h * 60, s, l];
};

const hsl = (h, s, l) => `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;

export const pickColor = (data) => {
	const BINS = 24;
	const bins = Array.from({ length: BINS }, () => ({ w: 0, h: 0, s: 0, l: 0 }));
	let opaque = 0, colored = 0;

	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < 160) continue;
		opaque++;
		const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
		if (s < 0.28 || l < 0.12 || l > 0.9) continue;
		colored++;
		const w = s * (1 - Math.abs(l - 0.5));
		const bin = bins[Math.floor(h / (360 / BINS)) % BINS];
		bin.w += w;
		bin.h += h * w;
		bin.s += s * w;
		bin.l += l * w;
	}

	if (!opaque || colored / opaque < 0.06) return null;

	// strongest hue group, merged with its neighbours so a gradient counts once
	let best = 0;
	for (let i = 1; i < BINS; i++) if (bins[i].w > bins[best].w) best = i;
	const group = [bins[(best + BINS - 1) % BINS], bins[best], bins[(best + 1) % BINS]];
	const w = group.reduce((t, b) => t + b.w, 0);
	if (!w) return null;

	// circular mean of hue across the group
	let x = 0, y = 0, s = 0, l = 0;
	for (const b of group) {
		if (!b.w) continue;
		const hh = (b.h / b.w) * (Math.PI / 180);
		x += Math.cos(hh) * b.w;
		y += Math.sin(hh) * b.w;
		s += b.s;
		l += b.l;
	}
	const h = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

	// readable on the dark theme: vivid, mid lightness
	return hsl(h, Math.min(0.9, Math.max(0.55, s / w)), Math.min(0.58, Math.max(0.44, l / w)));
};

const readImage = (src) =>
	new Promise((resolve) => {
		const img = new Image();
		img.decoding = 'async';
		img.onload = () => {
			try {
				const c = document.createElement('canvas');
				c.width = c.height = 32;
				const ctx = c.getContext('2d', { willReadFrequently: true });
				ctx.drawImage(img, 0, 0, 32, 32);
				resolve(pickColor(ctx.getImageData(0, 0, 32, 32).data));
			} catch {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = `/api/img?u=${encodeURIComponent(src)}`;
	});

/** Main color of a Sleeper avatar, or null (gray/black/white logo, or not loadable). */
export const getLogoColor = (src) => {
	if (!browser || !src || !String(src).startsWith('https://sleepercdn.com/')) return Promise.resolve(null);
	if (memo.has(src)) return memo.get(src);
	const s = loadSaved();
	if (src in s) {
		const p = Promise.resolve(s[src]);
		memo.set(src, p);
		return p;
	}
	const p = readImage(src).then((color) => {
		persist(src, color);
		return color;
	});
	memo.set(src, p);
	return p;
};
