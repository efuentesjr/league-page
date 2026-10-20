<script>
	import { gotoManager } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import TransactionMove from './TransactionMove.svelte';
	import { onMount } from 'svelte';
	import { getTradeGrades, gradeTone } from '$lib/utils/helperFunctions/tradeGradesClient';

	export let transaction, players, leagueTeamManagers;

	// trade grade per side (starting-lineup points since the trade)
	let graded = null;
	onMount(async () => {
		if (transaction.type !== 'trade') return;
		try {
			const grades = await getTradeGrades();
			graded = grades.byID[String(transaction.id)] || null;
		} catch (err) {
			console.error('[TradeTransaction] Could not load trade grades:', err);
		}
	});

	const sideFor = (rosterID, g) => g?.sides.find((s) => Number(s.rosterID) === Number(rosterID));
</script>

<style>
    .tradeTransaction {
        display: flex;
        position: relative;
        flex-direction: column;
        margin-bottom: 1em;
    }
    
    .name {
        position: relative;
        text-align: center;
    }

    .avatar {
        border-radius: 50%;
        height: 40px;
        width: 40px;
        border: 2px solid var(--blueOne);
        background-color: var(--fff);
    }

    .ownerName {
        display: inline-block;
        font-weight: normal;
        line-height: 1em;
        margin: 0.2em;
    }

    .currentOwner {
        font-style: italic;
        color: var(--aaa);
        font-size: 0.7em;
    }

    .clickable {
        cursor: pointer;
    }

    .date {
        color: var(--g999);
        font-style: italic;
        font-size: 0.7em;
        text-align: center;
        padding: 0.7em 0 1em;
        background-color: var(--fff);
        border-radius: 0 0 0 40px;
        border-left: 2px solid var(--blueOne);
        border-right: 1px solid var(--ddd);
        margin-bottom: 3em;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        /*
            the height setting is ignored, but
            allows the holder class div to have
            a height of 100%
        */
        height: 1px;
    }

    tbody {
        background-color: var(--fff);
        border-top: 2px solid var(--blueOne);
        border-left: 2px solid var(--blueOne);
        border-right: 1px solid var(--ddd);
    }

    .holder {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;
    }

    .grade {
        display: inline-flex;
        align-items: baseline;
        gap: 6px;
        margin: 4px 0 6px;
        padding: 2px 8px;
        font-family: 'Chakra Petch', 'Roboto', sans-serif;
        font-size: 0.85em;
        border: 1px solid currentColor;
    }

    .grade strong {
        font-weight: 700;
    }

    .gradePts {
        font-size: 0.85em;
        opacity: 0.8;
    }

    .tone-great {
        color: var(--mf-up, #128a4a);
        box-shadow: 0 0 10px -3px currentColor;
    }

    .tone-good {
        color: var(--mf-ion);
    }

    .tone-meh {
        color: #e2722b;
    }

    .tone-bad {
        color: var(--mf-down, #c2263b);
    }

    .tone-muted {
        color: var(--mf-dim);
    }

    .conditionalTag {
        display: inline-block;
        margin-right: 6px;
        padding: 1px 6px;
        font-style: normal;
        font-weight: 700;
        font-size: 0.95em;
        color: #e2722b;
        border: 1px solid currentColor;
    }

    .tradeNote {
        display: block;
        margin-top: 4px;
        font-style: normal;
        color: var(--mf-text);
    }

    .gradeNote {
        display: block;
        margin-top: 4px;
        font-style: normal;
    }

    @media (max-width: 420px) {
        .ownerName {
            font-size: 0.8em;
        }
    }
</style>

<div class="tradeTransaction">
    <table>
        <thead>
            <tr>
                {#each transaction.rosters as owner}
                    <th class="name clickable" style="width: {1 / transaction.rosters.length * 100}%;" onclick={() => gotoManager({year: transaction.season, leagueTeamManagers, rosterID: owner})}>
                        <div class="holder">
                            <img class="avatar" src="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).avatar}" alt="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name} avatar"/>
                            <span class="ownerName">
                                {getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name}
                                {#if getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name != getTeamFromTeamManagers(leagueTeamManagers, owner).name}
                                    <br />
                                    <span class="currentOwner">({getTeamFromTeamManagers(leagueTeamManagers, owner).name})</span>
                                {/if}
                            </span>
                            {#if sideFor(owner, graded)}
                                {@const side = sideFor(owner, graded)}
                                <span class="grade tone-{gradeTone(side.grade)}" title="Starting-lineup points from what they received, since the trade">
                                    <strong>{side.grade}</strong>
                                    {#if side.grade !== 'FAAB deal'}<span class="gradePts">{side.value} pts</span>{/if}
                                </span>
                            {/if}
                        </div>
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each transaction.moves as move}
                <TransactionMove {players} {move} type={transaction.type} {leagueTeamManagers} season={transaction.season} />
            {/each}
        </tbody>
    </table>
    <span class="date">
        {#if transaction.conditional}
            <span class="conditionalTag">Conditional</span>
        {/if}
        {transaction.date}
        {#if transaction.note}
            <span class="tradeNote">{transaction.note}</span>
        {/if}
        {#if graded}
            <span class="gradeNote">
                Graded on starting-lineup points since the trade{graded.weeks ? ` (${graded.weeks} week${graded.weeks === 1 ? '' : 's'})` : ''}.
                <a href="/trade-grades">Report card</a>
            </span>
        {/if}
    </span>
</div>
