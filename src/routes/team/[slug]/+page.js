// src/routes/team/[slug]/+page.js
export async function load({ params, parent }) {
  const parentData = await parent(); // keep upstream title/logo/etc.
  return {
    ...parentData,
    slug: params.slug,
    // use the SAME folder where your main playoffs tab keeps the .png avatars
    avatarBasePath: parentData?.avatarBasePath ?? '/playoffs-projection/avatars'
  };
}

