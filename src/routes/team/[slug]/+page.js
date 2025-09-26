// +page.js
export async function load({ params }) {
  const slug = params.slug;
  return {
    slug,
    title: 'Team Name Here',       // real name later
    logoUrl: '',                   // optional primary URL if you have it
    // avatarBasePath: '/team-avatars' // optional override if needed
  };
}
