import { managers as managersObj } from '$lib/utils/leagueInfo';
import { goto } from '$app/navigation';
import { stringDate } from './news';

const QUESTION = 'managers/question.jpg';
const FALLBACK_AVATAR = 'https://sleepercdn.com/images/v2/icons/player_default.webp';

/* -------------------------- small helpers -------------------------- */

const clean = (s) => (s || '').toLowerCase().replace(/\s+/g, '');
export const cleanName = (name) =>
  name.replace('Team ', '').toLowerCase().replace(/[ ’'!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, '');

export const round = (num) => {
  if (typeof num === 'string') num = parseFloat(num);
  return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
};

const _min = (stats, roundOverride, maxVal) => {
  const num = Math.min(...stats);
  let minAnswer = Math.floor(num / roundOverride) * roundOverride;
  if (maxVal && num > 0) {
    let i = 0;
    while (minAnswer > 0 && (num - minAnswer) / (maxVal - minAnswer) < 0.15) {
      minAnswer -= roundOverride;
      i++;
      if (i > 100) break; // emergency exit
    }
  }
  return minAnswer > 0 ? minAnswer : 0;
};

const _max = (stats, roundOverride) => {
  const num = Math.max(...stats);
  return Math.ceil(num / roundOverride) * roundOverride;
};

// Normalize year to something valid and return the season map (handles "2025" and 2025 keys)
function getYearMap(teamManagers, year) {
  if (!teamManagers) return null;
  const curSeason = Number(teamManagers.currentSeason);
  let y = year == null ? curSeason : Number(year);
  if (!Number.isFinite(y) || y > curSeason) y = curSeason;
  return teamManagers.teamManagersMap?.[y] ?? teamManagers.teamManagersMap?.[String(y)] ?? null;
}

// Get the roster entry for a season, trying both numeric and string keys
function getRosterEntry(teamManagers, rosterID, year) {
  const map = getYearMap(teamManagers, year);
  if (!map) return null;
  const ridNum = Number(rosterID);
  const ridStr = String(rosterID);
  return map[ridNum] ?? map[ridStr] ?? null;
}

// First/primary owner user id for a roster entry
function getPrimaryOwnerId(entry) {
  if (!entry) return null;
  if (Array.isArray(entry.managers) && entry.managers.length) return entry.managers[0];
  return entry.owner_id ?? entry.managerID ?? null;
}

/* ------------------------ navigation + authors --------------------- */

export const gotoManager = ({ leagueTeamManagers, managerID, rosterID, year }) => {
  if (!managersObj.length) return;
  let managersIndex = -1;

  if (!year || year > leagueTeamManagers.currentSeason) {
    year = leagueTeamManagers.currentSeason;
  }

  if (managerID) {
    managersIndex = managersObj.findIndex((m) => m.managerID == managerID);

    if (managersIndex < 0 && leagueTeamManagers.teamManagersMap[year] != null) {
      for (const rID in leagueTeamManagers.teamManagersMap[year]) {
        if (leagueTeamManagers.teamManagersMap[year][rID] == null) continue;
        for (const mID of leagueTeamManagers.teamManagersMap[year][rID].managers) {
          if (mID == managerID) {
            managersIndex = managersObj.findIndex((m) => m.roster == rID);
            goto(`/manager?manager=${managersIndex}`);
            return;
          }
        }
      }
    }
  } else if (rosterID) {
    if (leagueTeamManagers.teamManagersMap[year] != null) {
      const entry = getRosterEntry(leagueTeamManagers, rosterID, year);
      if (entry && Array.isArray(entry.managers)) {
        for (const mID of entry.managers) {
          managersIndex = managersObj.findIndex((m) => m.managerID == mID);
          if (managersIndex > -1) {
            goto(`/manager?manager=${managersIndex}`);
            return;
          }
        }
      }
    }
    managersIndex = managersObj.findIndex((m) => m.roster == rosterID);
  }

  goto(`/manager?manager=${managersIndex}`);
};

export const getAuthor = (leagueTeamManagers, author) => {
  for (const userID in (leagueTeamManagers?.users || {})) {
    const u = leagueTeamManagers.users[userID];
    if (u?.user_name?.toLowerCase?.() === author?.toLowerCase?.()) {
      return [`<a href="/manager?manager=${managersObj.findIndex((m) => m.managerID == String(userID))}">${u.display_name}</a>`];
    }
  }
  return author;
};

export const getAvatar = (leagueTeamManagers, author) => {
  for (const uID in (leagueTeamManagers?.users || {})) {
    const u = leagueTeamManagers.users[uID];
    if (u?.user_name?.toLowerCase?.() === author?.toLowerCase?.()) {
      return `https://sleepercdn.com/avatars/thumbs/${u.avatar}`;
    }
  }
  return QUESTION;
};

/* ---------------------------- dates & graphs ----------------------- */

export const parseDate = (rawDate) => {
  const ts = Date.parse(rawDate);
  const d = new Date(ts);
  return stringDate(d);
};

export const generateGraph = ({ stats, x, stat, header, field, short, secondField = null }, year, roundOverride = 10, xMinOverride = null) => {
  if (!stats) return null;
  const graph = {
    stats: [],
    secondStats: [],
    managerIDs: [],
    rosterIDs: [],
    labels: { x, stat },
    header,
    xMin: 0,
    xMax: 0,
    short,
    year
  };

  const sortedStats = [...stats].sort((a, b) => b[field] - a[field]);

  for (const indivStat of sortedStats) {
    graph.stats.push(indivStat[field]);
    if (secondField) graph.secondStats.push(indivStat[secondField]);
    if (indivStat.managerID) {
      graph.managerIDs.push(indivStat.managerID);
      graph.rosterIDs.push(null);
    } else if (indivStat.rosterID) {
      graph.managerIDs.push(null);
      graph.rosterIDs.push(indivStat.rosterID);
    }
  }

  graph.xMax = _max(graph.stats, roundOverride);
  graph.xMin = _min(graph.stats, roundOverride, graph.xMax);
  if (secondField) graph.xMin = _min(graph.secondStats, roundOverride, graph.xMax);
  if (xMinOverride != null) graph.xMin = xMinOverride;

  return graph;
};

export const sortHighAndLow = (arr, field) => {
  const sorted = arr.sort((a, b) => b[field] - a[field]);
  const high = sorted.slice(0, 10);
  const low = sorted.slice(-10).reverse();
  return [high, low];
};

/* ------------------------- league/user helpers --------------------- */

export const getManagers = (roster) => {
  const managers = [];
  if (roster?.owner_id) managers.push(roster.owner_id);
  if (Array.isArray(roster?.co_owners)) {
    for (const coOwner of roster.co_owners) managers.push(coOwner);
  }
  return managers;
};

export const getTeamData = (users, ownerID) => {
  const user = users?.[ownerID];
  if (user) {
    return {
      avatar: user.metadata?.avatar ? user.metadata.avatar : `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
      name: user.metadata?.team_name ? user.metadata.team_name : user.display_name
    };
  }
  return { avatar: FALLBACK_AVATAR, name: 'Unknown Team' };
};

/* --------------------- avatar & name (hardened) -------------------- */

export const getAvatarFromTeamManagers = (teamManagers, rosterID, year) => {
  const entry = getRosterEntry(teamManagers, rosterID, year);
  if (!entry) return QUESTION;

  const user = getPrimaryOwnerId(entry) ? teamManagers?.users?.[getPrimaryOwnerId(entry)] : null;
  return (
    entry.team?.avatar ||
    (user?.metadata?.avatar
      ? user.metadata.avatar
      : user?.avatar
      ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
      : QUESTION)
  );
};

export const getTeamNameFromTeamManagers = (teamManagers, rosterID, year) => {
  if (!teamManagers) return '';
  const entry = getRosterEntry(teamManagers, rosterID, year);
  if (!entry) return '';

  const curSeason = Number(teamManagers.currentSeason);
  const y = year == null ? curSeason : Number(year);
  const isHistorical = Number.isFinite(y) && y < curSeason;

  const user = getPrimaryOwnerId(entry) ? teamManagers?.users?.[getPrimaryOwnerId(entry)] : null;

  const nameFromMap = (entry.team?.name || '').trim();            // season-stored name (what Playoffs uses)
  const nameFromUser = (user?.metadata?.team_name || '').trim();  // manager's current Sleeper "Team Name"
  const ownerDisplay = (user?.display
