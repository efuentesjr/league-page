<!-- src/lib/Managers/Manager.svelte -->
<script>
    import Button, { Group, Label } from '@smui/button';
    import LinearProgress from '@smui/linear-progress';
    import { loadPlayers, getLeagueTransactions } from '$lib/utils/helper';
    import Roster from '../Rosters/Roster.svelte';
    import TransactionsPage from '../Transactions/TransactionsPage.svelte';
    import { goto } from '$app/navigation';
    import ManagerFantasyInfo from './ManagerFantasyInfo.svelte';
    import ManagerAwards from './ManagerAwards.svelte';
    import { onMount } from 'svelte';
    import { getDatesActive, getRosterIDFromManagerID, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

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

    const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;

    const maxPossibleEarnings = 5000;

    $: earningsPercent = Math.min(
        100,
        Math.round((managerTotalEarnings / maxPossibleEarnings) * 100)
    );

    let players, playersInfo;
    let loading = true;

    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        transactions = newTransactions.transactions;
    };

    onMount(async () => {
        if (transactionsData.stale) {
            refreshTransactions();
        }
        const playerData = await loadPlayers(null);
        playersInfo = playerData;
        players = playerData.players;
        loading = false;

        if (playerData.stale) {
            const newPlayerData = await loadPlayers(null, true);
            playersInfo = newPlayerData;
            players = newPlayerData.players;
        }
    });

    const changeManager = (newManager, noscroll = false) => {
        if (!newManager) {
            goto(`/managers`);
        }
        manager = newManager;
        goto(`/manager?manager=${newManager}`, { noscroll });
    };
</script>

<style>
    .managerContainer {
        width: 100%;
        margin: 2em 0 5em;
    }

    .managerConstrained {
        width: 97%;
        max-width: 800px;
        margin: 0 auto 4em;
    }

    .managerPhoto {
        display: block;
        border-radius: 100%;
        width: 70%;
        max-width: 200px;
        height: auto;
        margin: 5em auto 1em;
        box-shadow: 0 0 8px 4px #aaa;
    }

    h2 {
        text-align: center;
        font-size: 2.8em;
        margin: 1em 0 0em;
        line-height: 1em;
    }

    h3 {
        text-align: center;
        font-size: 1.5em;
        margin: 1.5em 0 0.5em;
        font-weight: 200;
    }

    .basicInfo {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        height: 24px;
        margin: 2em 0;
    }

    .basicInfo span {
        color: #888;
        font-size: 0.9em;
    }

    .infoChild {
        font-style: italic;
    }

    .infoContact {
        height: 20px;
        vertical-align: middle;
        padding-left: 1em;
    }

    .infoTeam {
        height: 48px;
    }

    .bio {
        margin: 2em 1.5em 2em;
        text-indent: 4em;
    }

    .philosophy {
        margin: 2em 1.5em 2em;
        text-indent: 4em;
    }

    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }

    .teamSub {
        font-size: 0.4em;
        line-height: 1em;
        color: #666;
    }

    .managerNav {
        margin: 4em 0 2em;
        text-align: center;
    }

    .upper {
        margin-top: 0;
    }

    .commissionerBadge {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 25px;
        width: 25px;
        font-weight: 600;
        border-radius: 15px;
        background-color: var(--blueTwo);
        border: 1px solid var(--blueOne);
    }

    .commissionerBadge span {
        font-style: normal;
        color: #fff;
    }

    .managerEarnings {
        width: min(520px, 92%);
        margin: 0 auto 1.5em;
        padding: 14px 16px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .managerEarningsHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
    }

    .managerEarningsTitle {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #9ca3af;
    }

    .managerEarningsTotal {
        font-size: 18px;
        font-weight: 700;
        color: #f5d56b;
    }

    .careerEarningsContainer {
        margin-bottom: 16px;
    }

    .careerEarningsLabel {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #9ca3af;
    }

    .careerEarningsValue {
        font-size: 22px;
        font-weight: 700;
        color: #f5d56b;
        margin: 4px 0 8px;
    }

    .earningsBar {
        width: 100%;
        height: 12px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
    }

    .earningsBarFill {
        height: 100%;
        background: linear-gradient(90deg, #f5d56b, #ffd700);
        transition: width 0.4s ease;
    }

    .managerEarningsTableWrap {
        overflow-x: auto;
    }

    .managerEarningsTable {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    .managerEarningsTable th {
        text-align: left;
        font-size: 12px;
        color: #94a3b8;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .managerEarningsTable td {
        padding: 7px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        color: #e5e7eb;
    }

    .managerEarningsTable tbody tr:last-child td {
        border-bottom: none;
    }

    .managerEarningsTable td:last-child {
        font-weight: 600;
    }

    .earningsChampion td:last-child {
        color: #f5d56b;
    }

    .earningsSecond td:last-child {
        color: #c0c0c0;
    }

    .earningsThird td:last-child {
        color: #cd7f32;
    }

    .managerEarningsEmpty {
        text-align: center;
        color: #94a3b8;
        font-size: 13px;
    }

    /* media queries */

    @media (max-width: 505px) {
        :global(.selectionButtons span) {
            font-size: 0.8em;
        }
    }

    @media (max-width: 435px) {
        :global(.selectionButtons span) {
            line-height: 1.2em;
            font-size: 0.8em;
        }
    }

    @media (max-width: 450px) {
        .basicInfo {
            height: 20px;
        }

        .basicInfo span {
            font-size: 0.75em;
        }

        .infoTeam {
            height: 30px;
        }

        .managerEarnings {
            width: min(94%, 94%);
            padding: 12px 14px;
        }

        .managerEarningsTotal {
            font-size: 16px;
        }

        .careerEarningsValue {
            font-size: 18px;
        }

        .managerEarningsTable th,
        .managerEarningsTable td {
            font-size: 13px;
        }
    }

    @media (max-width: 370px) {
        .basicInfo {
            height: 18px;
        }

        .basicInfo span {
            font-size: 0.6em;
        }

        .infoTeam {
            height: 24px;
        }
    }
</style>

<div class="managerContainer">
    <div class="managerConstrained">
        <img class="managerPhoto" src="{viewManager.photo}" alt="manager" />
        <h2>
            {viewManager.name}
            <div class="teamSub">
                {coOwners ? 'Co-' : ''}Manager of
                <i>{getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, year)}</i>
            </div>
        </h2>

        <div class="basicInfo">
            <span class="infoChild">{viewManager.location || 'Undisclosed Location'}</span>

            {#if viewManager.fantasyStart || (viewManager.managerID && datesActive.start)}
                <span class="seperator">|</span>

                {#if viewManager.fantasyStart}
                    <span class="infoChild">
                        EST '{viewManager.fantasyStart.toString().substr(2)}
                    </span>
                {:else if datesActive.end}
                    <span class="infoChild">
                        In the league from '{datesActive.start.toString().substr(2)} to '{datesActive.end.toString().substr(2)}
                    </span>
                {:else}
                    <span class="infoChild">
                        In the league since '{datesActive.start.toString().substr(2)}
                    </span>
                {/if}
            {/if}

            {#if viewManager.preferredContact}
                <span class="seperator">|</span>
                <span class="infoChild">
                    {viewManager.preferredContact}
                    <img class="infoChild infoContact" src="/{viewManager.preferredContact}.png" alt="favorite team" />
                </span>
            {/if}

            {#if viewManager.favoriteTeam}
                <span class="seperator">|</span>
                <img
                    class="infoChild infoTeam"
                    src="https://sleepercdn.com/images/team_logos/nfl/{viewManager.favoriteTeam}.png"
                    alt="favorite team"
                />
            {/if}

            {#if commissioner}
                <span class="seperator">|</span>
                <div class="infoChild commissionerBadge">
                    <span>C</span>
                </div>
            {/if}
        </div>

        <div class="managerEarnings">
            <div class="managerEarningsHeader">
                <span class="managerEarningsTitle">Earnings</span>
                <span class="managerEarningsTotal">{formatMoney(managerTotalEarnings)}</span>
            </div>

            <div class="careerEarningsContainer">
                <div class="careerEarningsLabel">Career Earnings</div>
                <div class="careerEarningsValue">{formatMoney(managerTotalEarnings)}</div>

                <div class="earningsBar">
                    <div
                        class="earningsBarFill"
                        style="width: {earningsPercent}%"
                    ></div>
                </div>
            </div>

            {#if managerEarnings.length}
                <div class="managerEarningsTableWrap">
                    <table class="managerEarningsTable">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Amount</th>
                                <th>Result</th>
                            </tr>
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
                </div>
            {:else}
                <div class="managerEarningsEmpty">No winnings recorded</div>
            {/if}
        </div>

        <div class="managerNav upper">
            <Group variant="outlined">
                {#if manager == 0}
                    <Button
                        disabled
                        class="selectionButtons"
                        onclick={() => changeManager(parseInt(manager) - 1, true)}
                        variant="outlined"
                    >
                        <Label>Previous Manager</Label>
                    </Button>
                {:else}
                    <Button
                        class="selectionButtons"
                        onclick={() => changeManager(parseInt(manager) - 1, true)}
                        variant="outlined"
                    >
                        <Label>Previous Manager</Label>
                    </Button>
                {/if}

                <Button class="selectionButtons" onclick={() => goto('/managers')} variant="outlined">
                    <Label>All Managers</Label>
                </Button>

                {#if manager == managers.length - 1}
                    <Button
                        disabled
                        class="selectionButtons"
                        onclick={() => changeManager(parseInt(manager) + 1, true)}
                        variant="outlined"
                    >
                        <Label>Next Manager</Label>
                    </Button>
                {:else}
                    <Button
                        class="selectionButtons"
                        onclick={() => changeManager(parseInt(manager) + 1, true)}
                        variant="outlined"
                    >
                        <Label>Next Manager</Label>
                    </Button>
                {/if}
            </Group>
        </div>

        <p class="bio">{@html viewManager.bio}</p>

        {#if viewManager.philosophy}
            <h3>Team Philosophy</h3>
            <p class="philosophy">{@html viewManager.philosophy}</p>
        {/if}
    </div>

    {#if !loading}
        <ManagerFantasyInfo {viewManager} {players} {changeManager} />
    {/if}

    <ManagerAwards
        {leagueTeamManagers}
        tookOver={viewManager.tookOver}
        {awards}
        {records}
        {rosterID}
        managerID={viewManager.managerID}
    />

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

    <h3>Team Transactions</h3>
    <div class="managerConstrained">
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

    <div class="managerNav">
        <Group variant="outlined">
            {#if manager == 0}
                <Button disabled class="selectionButtons" onclick={() => changeManager(parseInt(manager) - 1)} variant="outlined">
                    <Label>Previous Manager</Label>
                </Button>
            {:else}
                <Button class="selectionButtons" onclick={() => changeManager(parseInt(manager) - 1)} variant="outlined">
                    <Label>Previous Manager</Label>
                </Button>
            {/if}

            <Button class="selectionButtons" onclick={() => goto('/managers')} variant="outlined">
                <Label>All Managers</Label>
            </Button>

            {#if manager == managers.length - 1}
                <Button disabled class="selectionButtons" onclick={() => changeManager(parseInt(manager) + 1)} variant="outlined">
                    <Label>Next Manager</Label>
                </Button>
            {:else}
                <Button class="selectionButtons" onclick={() => changeManager(parseInt(manager) + 1)} variant="outlined">
                    <Label>Next Manager</Label>
                </Button>
            {/if}
        </Group>
    </div>
</div>
