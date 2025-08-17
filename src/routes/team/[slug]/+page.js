export const load = ({ params }) => {
  const slug = params.slug.toLowerCase();
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // point to your actual JPG
  const img = "/team/path.jpg";

  return { slug, title, img };
};
