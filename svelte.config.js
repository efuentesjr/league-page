import vercel from '@sveltejs/adapter-vercel';

const config = {
  kit: {
    adapter: vercel({
      runtime: 'nodejs22.x' // ✅ use Vercel’s Node 22 runtime
    })
  }
};

export default config;
