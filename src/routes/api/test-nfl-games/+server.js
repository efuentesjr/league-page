import { json } from '@sveltejs/kit';
import { getNflGames } from '$lib/utils/helperFunctions/nflGames';

export async function GET() {
	try {
		const games = await getNflGames(2026, 1);

		return json(games);
	} catch (err) {
		console.error(err);
		return json(
			{ error: 'Unable to fetch NFL games' },
			{ status: 500 }
		);
	}
}
