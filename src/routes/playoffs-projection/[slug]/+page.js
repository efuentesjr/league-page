// Minimal loader so the page exists and we can see the slug.
// This alone will stop the 404.
export const load = ({ params }) => {
  return { slug: params.slug };
};
