// src/lib/utils/slug.js

// Base slugifier
export function toSlug(name = '') {
  return String(name)
    .normalize('NFKD')                // strip accents
    .replace(/[\u2019\u2018']/g, '')  // remove apostrophes (’ ‘ ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')      // non-alnum -> dash
    .replace(/(^-|-$)/g, '');         // trim leading/trailing dashes
}

// Known exceptions: force the exact slugs you want
const overrides = {
  'the people’s champ': 'peoples-champ',
  "the people's champ": 'peoples-champ',
  'peoples champ': 'peoples-champ'
};

// Public helper: use this everywhere you need a team slug
export function slugFor(name = '') {
  const key = String(name).toLowerCase().trim();
  return overrides[key] ?? toSlug(name);
}
