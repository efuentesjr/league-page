// src/routes/team/[slug]/+page.js
export const load = ({ params }) => {
  const slug = params.slug.toLowerCase();
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Keep your original image path to avoid breaking the view
  const img = "/team/path.jpg";

  // We’ll fill this from the API later (client-side), keep empty for now
  const logoUrl = "";

  return { slug, title, img, logoUrl };
};
