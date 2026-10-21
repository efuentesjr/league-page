<!-- src/lib/Managers/Manager.svelte -->
<script>
    import LinearProgress from '@smui/linear-progress';
    import { loadPlayers, getLeagueTransactions, getLeagueData, getNflState, waitForAll } from '$lib/utils/helper';
    import {
        getManagerHistory,
        findRival,
        findTopScorer,
        computeTeamTiers
    } from '$lib/utils/helperFunctions/managerInsights';
    import Roster from '../Rosters/Roster.svelte';
    import TransactionsPage from '../Transactions/TransactionsPage.svelte';
    import { goto } from '$app/navigation';
    import ManagerFantasyInfo from './ManagerFantasyInfo.svelte';
    import ManagerAwards from './ManagerAwards.svelte';
    import { onMount } from 'svelte';
    import { getDatesActive, getRosterIDFromManagerID, getTeamNameFromTeamManagers, getAvatarFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import { getLogoColor } from '$lib/utils/logoColor';

    export let manager, managers, rostersData, leagueTeamManagers, rosterPositions, transactionsData, awards, records;

    let transactions = transactionsData.transactions;

    $: viewManager = managers[manager];

    $: datesActive = getDatesActive(leagueTeamManagers, viewManager.managerID);

    const startersAndReserve = rostersData.startersAndReserve;
    let rosters = rostersData.rosters;

    $: ({ rosterID, year } = viewManager.managerID
        ? getRosterIDFromManagerID(leagueTeamManagers, viewManager.managerID)
        : { rosterID: viewManager.roster, year: null });

    $: teamTransactions = transactions.filter((t) => t.rosters.includes(parseInt(rosterID)));

    $: roster = rosters[rosterID];

    $: coOwners = year && rosterID
        ? leagueTeamManagers.teamManagersMap[year][rosterID].managers.length > 1
        : roster.co_owners;

    $: commissioner = viewManager.managerID
        ? leagueTeamManagers.users[viewManager.managerID].is_owner
        : false;

    $: managerEarnings = viewManager?.earnings ?? [];
    $: managerTotalEarnings = Number(viewManager?.totalEarnings ?? 0);
    $: isChampion = managerEarnings.some((e) => e.title === 'Champion');

    const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;

    const maxPossibleEarnings = 5000;

    $: earningsPercent = Math.min(
        100,
        Math.round((managerTotalEarnings / maxPossibleEarnings) * 100)
    );

    let players, playersInfo;
    let loading = true;

    /*
     * Dynamic Rival / Favorite Player / Win Now-Rebuild.
     * history: all-time head-to-head + this season's player points
     */
    let history = null;
    let historyState = 'loading';
    let tiers = {};
    let tierInputs = null;

    const buildTiers = () => {
        if (!tierInputs || !players) return;
        tiers = computeTeamTiers({ rosters, players, ...tierInputs });
    };

    $: dynamicRival = history ? findRival(history, viewManager.managerID) : null;
    $: topScorer = history ? findTopScorer(history, roster) : null;
    $: teamTier = rosterID != null ? tiers[String(rosterID)] ?? null : null;

    // Favorite Fantasy Asset: the position this team rosters the most of
    // (ties go to the position with more starters, then QB > RB > WR > TE)
    const POS_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    $: favoritePosition = (() => {
        if (!roster || !players) return null;
        const counts = {}, starters = {};
        for (const pid of roster.players || []) {
            const pos = players[pid]?.pos;
            if (pos) counts[pos] = (counts[pos] || 0) + 1;
        }
        for (const pid of roster.starters || []) {
            const pos = players[pid]?.pos;
            if (pos) starters[pos] = (starters[pos] || 0) + 1;
        }
        const rank = (p) => (POS_ORDER.indexOf(p) + 1 || 99);
        const best = Object.keys(counts).sort(
            (x, y) => counts[y] - counts[x] || (starters[y] || 0) - (starters[x] || 0) || rank(x) - rank(y)
        )[0];
        return best ? { pos: best, count: counts[best] } : null;
    })();

    // Desire to Trade: trades this calendar year, ranked against the league
    // (most active trader = 10, no trades = 1, everyone else by rank)
    $: tradeYear = Number(leagueTeamManagers?.currentSeason) || new Date().getFullYear();
    $: tradeCounts = (() => {
        const counts = Object.fromEntries(Object.keys(rosters).map((id) => [id, 0]));
        for (const t of transactions || []) {
            if (t.type !== 'trade' || Number(t.season) !== tradeYear) continue;
            for (const r of t.rosters || []) if (String(r) in counts) counts[String(r)]++;
        }
        return counts;
    })();
    $: tradeDesire = (() => {
        if (rosterID == null) return null;
        const all = Object.values(tradeCounts);
        const count = tradeCounts[String(rosterID)] || 0;
        if (!count || all.length < 2) return { count, score: 1, year: tradeYear };
        const below = all.filter((c) => c < count).length;
        const equal = all.filter((c) => c === count).length;
        const pct = (below + (equal - 1) / 2) / (all.length - 1);
        return { count, score: Math.max(2, Math.round(1 + 9 * pct)), year: tradeYear };
    })();

    // Rookie or Vet: average age of the roster, split at the league median
    $: ageTier = (() => {
        if (!players || rosterID == null) return null;
        const avgAge = (r) => {
            const ages = (r?.players || []).map((pid) => Number(players[pid]?.a)).filter((a) => a > 0);
            return ages.length ? ages.reduce((t, a) => t + a, 0) / ages.length : null;
        };
        const all = Object.values(rosters).map(avgAge).filter((a) => a != null).sort((x, y) => x - y);
        const mine = avgAge(roster);
        if (mine == null || !all.length) return null;
        const mid = all.length / 2;
        const median = all.length % 2 ? all[Math.floor(mid)] : (all[mid - 1] + all[mid]) / 2;
        return { label: mine <= median ? 'Rookies' : 'Vets', avg: mine };
    })();

    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        transactions = newTransactions.transactions;
    };

    onMount(async () => {
        if (transactionsData.stale) refreshTransactions();

        getManagerHistory()
            .then((h) => {
                history = h;
                historyState = 'ready';
            })
            .catch((err) => {
                console.error('[Manager] Could not load head-to-head history:', err);
                historyState = 'error';
            });

        const playerData = await loadPlayers(null);
        playersInfo = playerData;
        players = playerData.players;
        loading = false;

        waitForAll(getLeagueData(), getNflState())
            .then(([leagueData, nflState]) => {
                tierInputs = { leagueData, nflState };
                buildTiers();
            })
            .catch((err) => console.error('[Manager] Could not build tiers:', err));

        if (playerData.stale) {
            const newPlayerData = await loadPlayers(null, true);
            playersInfo = newPlayerData;
            players = newPlayerData.players;
            buildTiers();
        }
    });

    const changeManager = (newManager, noscroll = false) => {
        if (!newManager) goto(`/managers`);
        manager = newManager;
        goto(`/manager?manager=${newManager}`, { noscroll });
    };

    // team color pulled from the team's logo (same as Power Rankings)
    $: teamAvatar = rosterID != null ? getAvatarFromTeamManagers(leagueTeamManagers, rosterID, year) : null;
    $: teamName = rosterID != null ? getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, year) : '';
    let teamColor = null;
    let colorFor = null;
    $: if (teamAvatar && teamAvatar !== colorFor) {
        colorFor = teamAvatar;
        teamColor = null;
        const want = teamAvatar;
        getLogoColor(want).then((c) => { if (c && colorFor === want) teamColor = c; }).catch(() => {});
    }
</script>

<style>
    .wrap {
        --team: var(--mf-ion);
        width: 96%;
        max-width: 1150px;
        margin: 0 auto;
        padding: 22px 0 60px;
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
        color: var(--mf-text);
    }

    /* ---------- prev / all / next ---------- */
    .topNav {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 12px;
    }

    .navBtn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        font: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--mf-dim);
        background: var(--mf-panel);
        border: 1px solid var(--mf-line);
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s, box-shadow 0.15s;
    }

    .navBtn:hover {
        color: var(--mf-ion);
        border-color: var(--mf-line-strong);
        box-shadow: 0 0 14px -6px var(--mf-ion-glow);
    }

    .navBtn.mid {
        margin: 0 auto;
    }

    /* ---------- hero ---------- */
    .hero {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 26px;
        padding: 26px 28px;
        background:
            linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
            linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
            radial-gradient(ellipse at 12% 50%, color-mix(in srgb, var(--team) 22%, transparent), transparent 55%),
            var(--mf-bg);
        border: 1px solid var(--mf-line);
        border-top: 2px solid var(--team);
        clip-path: polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px));
        transition: border-color 0.4s;
    }

    /* octagon photo: team-colored edge with a soft glow, sitting low in the header */
    .photoWrap {
        align-self: end;
        margin-bottom: -16px;
        filter: drop-shadow(0 0 16px color-mix(in srgb, var(--team) 55%, transparent));
    }

    .photoHex {
        width: 132px;
        height: 132px;
        padding: 3px;
        clip-path: polygon(29.3% 0, 70.7% 0, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0 70.7%, 0 29.3%);
        background: linear-gradient(160deg, var(--team), color-mix(in srgb, var(--team) 35%, #000) 50%, var(--team));
    }

    .photo {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #000;
        clip-path: polygon(29.3% 0, 70.7% 0, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0 70.7%, 0 29.3%);
    }

    .kicker {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--mf-dim);
    }

    h1 {
        margin: 4px 0 8px;
        font-size: 2.6rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        text-shadow: 0 0 18px var(--mf-line-strong);
    }

    .teamLine {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--team);
    }

    .teamLine img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid var(--mf-line-strong);
    }

    .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin-top: 14px;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 28px;
        padding: 0 10px;
        font-size: 0.78rem;
        color: var(--mf-text);
        background: var(--mf-panel);
        border: 1px solid var(--mf-line);
    }

    .chip img {
        height: 16px;
        width: auto;
    }

    .chip.logo img {
        height: 22px;
    }

    .chip.comm {
        color: var(--mf-on-ion);
        font-weight: 700;
        letter-spacing: 0.06em;
        background: var(--mf-ion);
        border-color: var(--mf-ion);
    }

    /* earnings tile */
    .earn {
        min-width: 200px;
        padding: 14px 16px;
        background: var(--mf-panel);
        border: 1px solid color-mix(in srgb, #f5d56b 45%, var(--mf-line));
        border-top: 2px solid #f5d56b;
    }

    .earnTop {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }

    .earnLabel {
        font-size: 0.66rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--mf-dim);
    }

    .earnValue {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.05;
        color: #f5d56b;
        text-shadow: 0 0 16px rgba(245, 213, 107, 0.35);
        font-variant-numeric: tabular-nums;
    }

    .moneyIcon {
        width: 40px;
        height: 40px;
        object-fit: contain;
    }

    .champGlow {
        animation: goldPulse 2.5s ease-in-out infinite;
    }

    @keyframes goldPulse {
        0%, 100% {
            filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.3));
            transform: scale(1);
        }
        50% {
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.85));
            transform: scale(1.08);
        }
    }

    .earnBar {
        height: 6px;
        margin-top: 10px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
    }

    .earnFill {
        position: relative;
        height: 100%;
        background: linear-gradient(90deg, #f5d56b, #ffd700);
        box-shadow: 0 0 10px rgba(245, 213, 107, 0.45);
    }

    .championBar::after {
        content: '';
        position: absolute;
        inset: 0 auto 0 -40%;
        width: 40%;
        background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.6), transparent);
        animation: shimmer 3s infinite;
    }

    @keyframes shimmer {
        from { left: -40%; }
        to { left: 120%; }
    }

    .earnNote {
        margin-top: 6px;
        font-size: 0.72rem;
        color: var(--mf-dim);
    }

    /* ---------- panels ---------- */
    .cols {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
        gap: 18px;
        margin-top: 18px;
        align-items: start;
    }

    .panel {
        margin-top: 18px;
        background: var(--mf-panel);
        border: 1px solid var(--mf-line);
    }

    .cols .panel {
        margin-top: 0;
    }

    .panelHead {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 10px 14px;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--mf-dim);
        background: var(--mf-panel-2);
        border-bottom: 1px solid var(--mf-line);
        border-top: 2px solid var(--mf-ion);
    }

    .panelHead.gold {
        border-top-color: #f5d56b;
    }

    .panelHead small {
        font-size: 0.9em;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: none;
    }

    .panelBody {
        padding: 12px 14px;
    }

    .earnTable {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
        font-variant-numeric: tabular-nums;
    }

    .earnTable th {
        padding: 0 0 6px;
        text-align: left;
        font-size: 0.68rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--mf-dim);
        border-bottom: 1px solid var(--mf-line);
    }

    .earnTable td {
        padding: 8px 0 6px;
        border-bottom: 1px solid var(--mf-line);
    }

    .earnTable tr:last-child td {
        border-bottom: 0;
    }

    .earnTable td:last-child {
        font-weight: 700;
    }

    .earningsChampion td:last-child { color: #f5d56b; }
    .earningsSecond td:last-child { color: #c0c0c0; }
    .earningsThird td:last-child { color: #cd7f32; }

    .empty {
        margin: 0;
        font-size: 0.85rem;
        font-style: italic;
        color: var(--mf-dim);
    }

    .philosophy,
    .bio {
        margin: 0;
        font-family: 'Roboto', sans-serif;
        font-size: 0.95rem;
        line-height: 1.55;
        color: var(--mf-text);
    }

    .bio {
        margin-top: 10px;
        color: var(--mf-dim);
    }

    .lower {
        display: grid;
        grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
        gap: 18px;
        align-items: start;
        margin-top: 18px;
    }

    .rosterWrap :global(.rosterContainer),
    .rosterWrap :global(> *) {
        margin-top: 0 !important;
    }

    .txPanel {
        margin-top: 0;
    }

    @media (max-width: 980px) {
        .lower {
            grid-template-columns: minmax(0, 1fr);
        }
        .rosterWrap {
            display: flex;
            justify-content: center;
        }
    }

    .loading {
        width: 85%;
        max-width: 500px;
        margin: 40px auto;
        color: var(--mf-dim);
    }

    @media (max-width: 860px) {
        .hero {
            grid-template-columns: auto minmax(0, 1fr);
        }
        .earn {
            grid-column: 1 / -1;
        }
        .cols {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    @media (max-width: 560px) {
        .hero {
            grid-template-columns: minmax(0, 1fr);
            justify-items: center;
            text-align: center;
            padding: 22px 16px;
        }
        .photoWrap {
            align-self: center;
            margin-bottom: 0;
        }
        .photoHex {
            width: 112px;
            height: 112px;
        }
        h1 {
            font-size: 2rem;
        }
        .teamLine,
        .chips {
            justify-content: center;
        }
        .earn {
            width: 100%;
            text-align: left;
        }
        .navBtn {
            padding: 7px 10px;
            font-size: 0.7rem;
            letter-spacing: 0.06em;
        }
    }
</style>

<div class="wrap" style="--team: {teamColor || 'var(--mf-ion)'}">
    <nav class="topNav" aria-label="Managers">
        <button type="button" class="navBtn" onclick={() => changeManager(parseInt(manager) - 1, true)}>← Previous</button>
        <button type="button" class="navBtn mid" onclick={() => goto('/managers')}>All Managers</button>
        <button type="button" class="navBtn" onclick={() => changeManager(parseInt(manager) + 1, true)}>Next →</button>
    </nav>

    <header class="hero">
        <div class="photoWrap">
            <div class="photoHex">
                <img class="photo" src={viewManager.photo} alt={viewManager.name} />
            </div>
        </div>

        <div class="heroMain">
            <div class="kicker">{coOwners ? 'Co-Manager' : 'Manager'}</div>
            <h1>{viewManager.name}</h1>
            <div class="teamLine">
                {#if teamAvatar}<img src={teamAvatar} alt="" />{/if}
                <span>{teamName}</span>
            </div>
            <div class="chips">
                <span class="chip">{viewManager.location || 'Undisclosed Location'}</span>
                {#if viewManager.fantasyStart}
                    <span class="chip">Playing since {viewManager.fantasyStart}</span>
                {/if}
                {#if viewManager.preferredContact}
                    <span class="chip">
                        <img src="/{viewManager.preferredContact}.png" alt="" />
                        {viewManager.preferredContact}
                    </span>
                {/if}
                {#if viewManager.favoriteTeam}
                    <span class="chip logo" title="Favorite NFL team">
                        <img src="https://sleepercdn.com/images/team_logos/nfl/{viewManager.favoriteTeam}.png" alt={viewManager.favoriteTeam} />
                        {viewManager.favoriteTeam.toUpperCase()}
                    </span>
                {/if}
                {#if commissioner}
                    <span class="chip comm">Commissioner</span>
                {/if}
            </div>
        </div>

        <div class="earn">
            <div class="earnTop">
                <div>
                    <div class="earnLabel">Career Earnings</div>
                    <div class="earnValue">{formatMoney(managerTotalEarnings)}</div>
                </div>
                <img src="/Money.png" alt="" class="moneyIcon" class:champGlow={isChampion} />
            </div>
            <div class="earnBar">
                <div class="earnFill" class:championBar={isChampion} style="width:{earningsPercent}%"></div>
            </div>
            <div class="earnNote">
                {managerEarnings.length ? `${managerEarnings.length} paid finish${managerEarnings.length === 1 ? '' : 'es'}` : 'No winnings yet'}
            </div>
        </div>
    </header>

    <div class="cols">
        <section class="panel">
            <div class="panelHead gold"><span>Payouts</span></div>
            <div class="panelBody">
                {#if managerEarnings.length}
                    <table class="earnTable">
                        <thead>
                            <tr><th>Year</th><th>Amount</th><th>Result</th></tr>
                        </thead>
                        <tbody>
                            {#each managerEarnings as item}
                                <tr
                                    class:earningsChampion={item.title === 'Champion'}
                                    class:earningsSecond={item.title === '2nd Place'}
                                    class:earningsThird={item.title === '3rd Place'}
                                >
                                    <td>{item.year}</td>
                                    <td>{formatMoney(item.amount)}</td>
                                    <td>{item.title}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p class="empty">No winnings recorded yet.</p>
                {/if}
            </div>
        </section>

        <section class="panel">
            <div class="panelHead"><span>Team Philosophy</span></div>
            <div class="panelBody">
                {#if viewManager.philosophy}
                    <p class="philosophy">{@html viewManager.philosophy}</p>
                {/if}
                {#if viewManager.bio}
                    <p class="bio">{@html viewManager.bio}</p>
                {/if}
                {#if !viewManager.philosophy && !viewManager.bio}
                    <p class="empty">No philosophy shared yet.</p>
                {/if}
            </div>
        </section>
    </div>

    {#if !loading}
        <section class="panel">
            <div class="panelHead"><span>Scouting Report</span><small>updates automatically</small></div>
            <ManagerFantasyInfo {viewManager} {players} {changeManager} {dynamicRival} {topScorer} {teamTier} {historyState} {favoritePosition} {tradeDesire} {ageTier} />
        </section>
    {/if}

    <section class="panel">
        <div class="panelHead gold"><span>Awards &amp; Records</span></div>
        <ManagerAwards
            {leagueTeamManagers}
            tookOver={viewManager.tookOver}
            {awards}
            {records}
            {rosterID}
            managerID={viewManager.managerID}
        />
    </section>

    <div class="lower">
    <div class="rosterWrap">
        {#if loading}
            <div class="loading">
                <p>Retrieving players...</p>
                <LinearProgress indeterminate />
            </div>
        {:else}
            <Roster
                division="1"
                expanded={false}
                {rosterPositions}
                {roster}
                {leagueTeamManagers}
                {players}
                {startersAndReserve}
            />
        {/if}
    </div>

    <section class="panel txPanel">
        <div class="panelHead"><span>Team Transactions</span></div>
        <div class="panelBody">
            {#if loading}
                <div class="loading">
                    <p>Retrieving players...</p>
                    <LinearProgress indeterminate />
                </div>
            {:else}
                <TransactionsPage
                    {playersInfo}
                    transactions={teamTransactions}
                    {leagueTeamManagers}
                    show="both"
                    query=""
                    page={0}
                    perPage={5}
                />
            {/if}
        </div>
    </section>
    </div>
</div>
