// src/routes/team/[slug]/+page.js
// Pass through whatever +page.server.js returns.
// (If you prefer, you can delete this file entirely.)
export const ssr = true;
export const csr = true;

/** @type {import('./$types').PageLoad} */
export async function load({ data }) {
  return data; // <-- just forward server data, no fetching, no errors
}
