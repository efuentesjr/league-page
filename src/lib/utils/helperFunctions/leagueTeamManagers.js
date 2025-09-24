const processUsers = (rawUsers) => {
  const finalUsers = {};
  for (const user of rawUsers) {
    // Keep Sleeper-provided names intact
    const cloned = { ...user };
    cloned.user_name = cloned.user_name ?? cloned.display_name;

    // If this manager exists in your local config, attach info WITHOUT overwriting display_name
    const manager = Array.isArray(managers)
      ? managers.find((m) => String(m.managerID) === String(cloned.user_id))
      : null;

    if (manager) {
      // Store your league’s preferred manager name separately (don’t clobber display_name)
      cloned.mffl_manager_name = manager.name ?? cloned.display_name;

      // If Sleeper has no team name but your config does, inject it gently
      const cfgTeamName = (manager.teamName ?? manager.team_name ?? '').trim();
      if (cfgTeamName) {
        cloned.metadata = { ...(cloned.metadata || {}) };
        if (!cloned.metadata.team_name || !String(cloned.metadata.team_name).trim()) {
          cloned.metadata.team_name = cfgTeamName;
        }
      }

      // Optional: prefer your saved logo if Sleeper lacks an avatar
      if (!cloned.avatar && manager.logoUrl) {
        cloned.avatar = manager.logoUrl;
      }
    }

    finalUsers[cloned.user_id] = cloned;
  }
  return finalUsers;
};
