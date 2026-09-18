/**
 * Manager Lineup IQ - Sandbox Calculation
 *
 * This module calculates a manager's lineup IQ using:
 *
 *   70% - Lineup Efficiency
 *   30% - Roster Strength
 *
 * Lineup Efficiency:
 *   Actual Points / Potential Points
 *
 * Roster Strength:
 *   Manager's Potential Points Per Game compared
 *   to the league median Potential Points Per Game.
 *
 * This module does NOT modify the existing Records class.
 */

const round = (value, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
};


/**
 * Calculate the median of an array of numbers.
 */
const median = (values) => {
    if (!values.length) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
};


/**
 * Calculate Manager Lineup IQ rankings.
 *
 * @param {Object} leagueManagerRecords
 * @returns {Object[]} Manager Lineup IQ records
 */
export const calculateManagerLineupIQ = (leagueManagerRecords) => {

    if (!leagueManagerRecords || typeof leagueManagerRecords !== 'object') {
        return [];
    }

    const managers = [];

    /*
     * First pass:
     * Calculate each manager's basic statistics.
     */
    for (const managerID in leagueManagerRecords) {

        const manager = leagueManagerRecords[managerID];

        const fptsFor = Number(manager.fptsFor) || 0;
        const potentialPoints = Number(manager.potentialPoints) || 0;
        const games =
            (Number(manager.wins) || 0) +
            (Number(manager.losses) || 0) +
            (Number(manager.ties) || 0);

        if (potentialPoints <= 0 || games <= 0) {
            continue;
        }

        const efficiency =
            (fptsFor / potentialPoints) * 100;

        const potentialPPG =
            potentialPoints / games;

        managers.push({
            managerID,
            fpts: fptsFor,
            potentialPoints,
            games,
            efficiency,
            potentialPPG
        });
    }


    /*
     * Find the league median Potential PPG.
     *
     * Median is intentionally used instead of average so that
     * extremely low/high teams don't distort the baseline.
     */
    const medianPotentialPPG = median(
        managers.map(manager => manager.potentialPPG)
    );


    /*
     * Second pass:
     * Calculate roster strength and final Manager Lineup IQ.
     */
    for (const manager of managers) {

        /*
         * A manager at the league median roster strength
         * has a roster-strength factor of 1.00.
         *
         * Above median = positive adjustment
         * Below median = negative adjustment
         */
        const rosterStrength =
            manager.potentialPPG / medianPotentialPPG;

        /*
         * 70% lineup efficiency
         * 30% roster strength
         *
         * The factor is centered at 1.00 so that a manager
         * with median roster strength receives no adjustment.
         */
        const adjustmentFactor =
            0.70 + (0.30 * rosterStrength);

        const managerIQ =
            manager.efficiency * adjustmentFactor;


        manager.efficiency = round(manager.efficiency);
        manager.potentialPPG = round(manager.potentialPPG);
        manager.rosterStrength = round(rosterStrength, 3);
        manager.adjustmentFactor = round(adjustmentFactor, 3);
        manager.iq = round(managerIQ);
    }


    /*
     * Highest Manager Lineup IQ first.
     */
    managers.sort((a, b) => b.iq - a.iq);


    /*
     * Add ranking and league baseline information.
     */
    managers.forEach((manager, index) => {
        manager.rank = index + 1;
        manager.medianPotentialPPG = round(medianPotentialPPG);
    });


    return managers;
};
