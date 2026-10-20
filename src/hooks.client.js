// Runs once in the browser when the site starts, before any page loads.
import { installSleeperCache } from '$lib/utils/sleeperCache';
import { leagueID } from '$lib/utils/leagueInfo';

installSleeperCache(leagueID);
