import { leagueID, managers } from '$lib/utils/leagueInfo';
import { get } from 'svelte/store';
import { teamManagersStore } from '$lib/stores';
import { waitForAll } from './multiPromise';
import { getManagers, getTeamData } from './universalFunctions';
import { getLeagueData } from './leagueData';

/**
 * Fetches Sleeper users/rosters across linked seasons and builds:
 * {
 *   currentSeason: number,
 *   teamManagersMap: { [season]: { [roster_id]: { team, managers[] } } },
 *   users: { [user_id]: processedUser }
 * }
 *
 * Also caches in teamManagersStore.
 */
export const getLeagueTeamManagers = async () => {
  const cached = get(teamManagersStore);
  if (cached && cached.currentSeason) {
    return cached;
  }

  let currentLeagueID = leagueID;
  let teamManagersMap = {};
  let finalUsers = {};
  let currentSeason = null;

  // Loop through all seasons in this league chain
  while (currentLeagueID && currentLeagueID != 0) {
    const [usersRaw, leagueData, rostersRaw] = await waitForAll(
      fetch(`https://api.sleeper.app/v1/league/${currentLeagueID}/users`, { compress: true }),
      getLeagueData(currentLeagueID),
      fetch(`https://api.sleeper.app/v1/league/${currentLeagueID}/rosters`, { compress: true }),
    ).catch((err) => {
      console.error('[getLeagueTeamManagers] network error', err);
      return [null, null, null];
    });

    if (!usersRaw || !rostersRaw || !leagueData) break;

    const [users, rosters] = await waitForAll(
      usersRaw.json(),
      rostersRaw.json(),
    ).catch((err) => {
      console.error('[getLeagueTeamManagers] json parse error', err);
      return [[], []];
    });

    const year = parseInt(leagueData.season);
    currentLeagueID = leagueData.previous_league_id;

    if (!currentSeason) {
      currentSeason = year;
    }

    teamManagersMap[year] = {};

    // Process users once per league, then merge without overwriting newer data
    const processedUsers = processUsers(users);

    for (const processedUserKey in processedUsers) {
      if (finalUsers[processedUserKey]) continue; // keep most recent
      finalUsers[processedUserKey] = processedUsers[processedUserKey];
    }

    for (const roster of rosters) {
      teamManagersMap[year][roster.roster_id] = {
        team: getTeamData(processedUsers, roster.owner_id),
        managers: getManagers(roster, processedUsers),
      };
    }
  }

  const response = {
    currentSeason,
    teamManagersMap,
    users: finalUsers,
  };

  teamManagersStore.update(() => response);
  return response;
};

/**
 * IMPORTANT FIX:
 * - Do NOT overwrite Sleeper's display_name (this can leak manager names into team labels).
 * - If local managers config has a teamName, gently surface it via metadata.team_name
 *   so downstream helpers (like getTeamData) can prefer it when Sleeper lacks a team name.
 */
const processUsers = (rawUsers) => {
  const finalUsers = {};
  for (const user of rawUsers) {
    // clone to avoid mutating the original
    const cloned = { ...user };

    // Ensure user_name exists (fallback to display_name)
    cloned.user_name = cloned.user_name ?? cloned.display_name;

    // Try to find this manager in your local config by ID
    const manager =
      Array.isArray(managers)
        ? managers.find((m) => String(m.managerID) === String(cloned.user_id))
        : null;

    if (manager) {
      // Keep Sleeper display_name intact; store your preferred manager label separately
      cloned.mffl_manager_name = manager.name ?? cloned.display_name;

      // If Sleeper lacks a team name but your config has one, inject it non-destructively
      const cfgTeamName = (manager.teamName ?? manager.team_name ?? '').trim();
      if (cfgTeamName) {
        cloned.metadata = { ...(cloned.metadata || {}) };
        if (!cloned.metadata.team_name || !String(cloned.metadata.team_name).trim()) {
          cloned.metadata.team_name = cfgTeamName;
        }
      }

      // Optional: if Sleeper has no avatar, borrow your configured logo
      if (!cloned.avatar && manager.logoUrl) {
        cloned.avatar = manager.logoUrl;
      }
    }

    finalUsers[cloned.user_id] = cloned;
  }
  return finalUsers;
};
