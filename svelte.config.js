import vercel from '@sveltejs/adapter-vercel';
import node from '@sveltejs/adapter-node';

const dockerBuild = process.env.DOCKER_BUILD;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: dockerBuild
			? node()
			: vercel({
					runtime: 'nodejs22.x' // ✅ Explicitly tell Vercel to use Node 22
			  })
	}
};

export default config;
