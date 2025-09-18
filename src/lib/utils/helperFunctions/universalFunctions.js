import { managers as managersObj } from '$lib/utils/leagueInfo';
import { goto } from "$app/navigation";
import { stringDate } from './news';

const QUESTION = 'managers/question.jpg';
const FALLBACK_AVATAR = 'https://sleepercdn.com/images/v2/icons/player_default.webp';

/* -------------------------- small helpers -------------------------- */

export const cleanName = (name) => {
  return name
    .replace('Team ', '')
    .toLowerCase()
    .replace(/[ ’'!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\]\\\]\^_`{|}~']/g, "");
};

export const round = (num) => {
  if (typeof num == "string") {
    num = parseFloat(num);
  }
  return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
};

const min = (stats, roundOverride, maxVal) => {
  const num = Math.min(...stats);
  let minAnswer = Math.floor(num / roundOverride) * roundOverride;
  if (maxVal && num > 0) {
    let i = 0;
    while (minAnswer > 0 && (num - minAnswer) / (maxVal - minAnswer) < .15) {
      minAnswer -= roundOverride;
      i++;
      if (i > 100) break; // safety
    }
  }
  return minAnswer > 0 ? minAnswer : 0;
};

const max = (stats, roundOverride) => {
  const num = Math.max(...stats);
  return Math.ceil(num / roundOverride) * roundOverride;
};

/* ---------- robust season/roster lookups (no JSX, safe JS) --------- */

function normalizeSeason(teamManagers, year) {
  if (!teamManagers) return null;
  const cur = Number(teamManagers.currentSeason);
  let y = (year == null) ? cur : Number(year);
  if (!isFinite(y) || y > cur) y = cur;
  return y;
}

function getYearMap(teamManagers, year) {
  const y = normalizeSeason(teamManagers, year);
  if (y == null) return null;
  const map = teamManagers.teamManagersMap || {};
  return map[y] || map[String(y)] || null;
}

function getRosterEntry(teamManagers, rosterID, year) {
  const yearMap = getYearMap(teamManagers, year);
  if (!yearMap) return null;
  const ridNum = Number(rosterID);
  const ridStr = String(rosterID);
  return yearMap[ridNum] || yearMap[ridStr] || null;
}

function getPrimaryOwnerId(entry) {
  if (!entry) return null;
  if (entry.managers && Array.isArray(entry.managers) && entry.managers.length) {
    return entry.managers[0];
  }
  return entry.owner_id || entry.managerID || null;
}

function cleanFlat(s) {
  return (s || '').toLowerCase().replace(/\s+/g, '');
}

/* ------------------------ navigation + authors --------------------- */

export const gotoManager = ({leagueTeamManagers, managerID, rosterID, year}) => {
  if (!managersObj.length) return;
  let managersIndex = -1;

  if (!year || year > leagueTeamManagers.currentSeason) {
    year = leagueTeamManagers.currentSeason;
  }

  if (managerID) {
    // modern approach
    managersIndex = managersObj.findIndex(m => m.managerID == managerID);

    // support for league pages still using deprecated roster field
    if (managersIndex < 0 && leagueTeamManagers.teamManagersMap[year] != null) {
      for (const rID in leagueTeamManagers.teamManagersMap[year]) {
        if (leagueTeamManagers.teamManagersMap[year][rID] == null) continue;
        const mgrs = leagueTeamManagers.teamManagersMap[year][rID].managers || [];
        for (let i = 0; i < mgrs.length; i++) {
          const mID = mgrs[i];
          if (mID == managerID) {
            managersIndex = managersObj.findIndex(m => m.roster == rID);
            goto(`/manager?manager=${managersIndex}`);
            return;
          }
        }
      }
    }
  } else if (rosterID) {
    // check for matching managerID first
    const entry = getRosterEntry(leagueTeamManagers, rosterID, year);
    if (entry && entry.managers && Array.isArray(entry.managers)) {
      for (let i = 0; i < entry.managers.length; i++) {
        const mID = entry.managers[i];
        managersIndex = managersObj.findIndex(m => m.managerID == mID);
        if (managersIndex > -1) {
          goto(`/manager?manager=${managersIndex}`);
          return;
        }
      }
    }
    // deprecated roster field
    managersIndex = managersObj.findIndex(m => m.roster == rosterID);
  }

  // if no manager exists for that roster, -1 will take you to the main managers page
  goto(`/manager?manager=${managersIndex}`);
};

export const getAuthor = (leagueTeamManagers, author) => {
  const users = (leagueTeamManagers && leagueTeamManagers.users) ? leagueTeamManagers.users : {};
  for (const userID in users) {
    const u = users[userID];
    if (u && u.user_name && author && u.user_name.toLowerCase() === author.toLowerCase()) {
      const idx = managersObj.findIndex(m => m.managerID == String(userID));
      return ['<a href="/manager?manager=' + idx + '">' + u.display_name + '</a>'];
    }
  }
  return author;
};

export const getAvatar = (leagueTeamManagers, author) => {
  const users = (leagueTeamManagers && leagueTeamManagers.users) ? leagueTeamManagers.users : {};
  for (const uID in users) {
    const u = users[uID];
    if (u && u.user_name && author && u.user_name.toLowerCase() === author.toLowerCase()) {
      return 'https://sleepercdn.com/avatars/thumbs/' + u.avatar;
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

export const generateGraph = ({stats, x, stat, header, field, short, secondField = null}, year, roundOverride = 10, xMinOverride = null) => {
  if (!stats) {
    return null;
  }
  const graph = {
    stats: [],
    secondStats: [],
    managerIDs: [],
    rosterIDs: [],
    labels: {x, stat},
    header,
    xMin: 0,
    xMax: 0,
    short,
    year
  };

  const sortedStats = [...stats].sort((a, b) => b[field] - a[field]);

  for (let i = 0; i < sortedStats.length; i++) {
    const indivStat = sortedStats[i];
    graph.stats.push(indivStat[field]);
    if (secondField) {
      graph.secondStats.push(indivStat[secondField]);
    }
    if (indivStat.managerID) {
      graph.managerIDs.push(indivStat.managerID);
      graph.rosterIDs.push(null);
    } else if (indivStat.rosterID) {
      graph.managerIDs.push(null);
      graph.rosterIDs.push(indivStat.rosterID);
    }
  }

  graph.xMax = max(graph.stats, roundOverride);
  graph.xMin = min(graph.stats, roundOverride, graph.xMax);
  if (secondField) {
    graph.xMin = min(graph.secondStats, roundOverride, graph.xMax);
  }
  if (xMinOverride != null) {
    graph.xMin = xMinOverride;
  }

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
  if (roster && roster.owner_id) {
    managers.push(roster.owner_id);
  }
  if (roster && roster.co_owners && Array.isArray(roster.co_owners)) {
    for (let i = 0; i < roster.co_owners.length; i++) {
      managers.push(roster.co_owners[i]);
    }
  }
  return managers;
};

ex
