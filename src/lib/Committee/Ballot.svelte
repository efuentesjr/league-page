<!--
	Committee Night ballot
	Commissioner opens one proposal at a time; managers vote with their
	personal code; secret ballot shows only a live counter until closed.
-->
<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { managers as leagueManagers } from '$lib/utils/leagueInfo';

	export let cards = []; // the page's proposal cards, to add to the ballot
	export let season = new Date().getFullYear() + 1;
	export let onresults = () => {};

	const RULE_TEXT = {
		regular: { label: 'Regular', text: 'Most votes wins · ties: commissioner decides' },
		scoring: { label: 'Scoring change', text: 'Majority and at least 9 yes votes (Constitution §4)' },
		dues: { label: 'Raising dues', text: 'Needs 11 yes votes (Constitution §7.3)' }
	};

	const people = leagueManagers.filter((m) => m.managerID).map((m) => ({ id: String(m.managerID), name: m.name, photo: m.photo }));
	const personOf = (id) => people.find((p) => p.id === id);

	let proposals = [];
	let attendance = {};
	let loaded = false;
	let loadError = '';
	let timer = null;

	// who's voting on this device
	let meID = '';
	let meCode = '';
	let myVotes = {}; // proposalID -> choice
	let voteError = {};
	let voting = {};

	// commissioner
	let commish = false;
	let commishCode = '';
	let showUnlock = false;
	let unlockInput = '';
	let unlockError = '';
	let busy = false;
	let actionError = '';

	// add / edit form
	let showForm = false;
	let editing = null;
	let fTitle = '', fDetails = '', fType = 'regular', fOptions = '', fOwner = '', fRef = '', fCard = '';

	// big screen
	let bigScreen = false;
	let screenEl;

	const ls = {
		get: (k) => {
			try {
				return localStorage.getItem(k) || '';
			} catch {
				return '';
			}
		},
		set: (k, v) => {
			try {
				localStorage.setItem(k, v);
			} catch {
				/* private mode */
			}
		},
		del: (k) => {
			try {
				localStorage.removeItem(k);
			} catch {
				/* ignore */
			}
		}
	};

	const api = async (body) => {
		const res = await fetch('/api/committee', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(data.message || 'Something went wrong. Try again.');
		return data;
	};

	const load = async (live = false) => {
		try {
			const res = await fetch(`/api/committee${live ? '?live=1' : ''}`, { cache: 'no-store' });
			if (!res.ok) throw new Error();
			const data = await res.json();
			const before = proposals.map((p) => `${p.id}:${p.status}`).join();
			const after = data.proposals.map((p) => `${p.id}:${p.status}`).join();
			if (live && before !== after) return load(false); // something opened/closed: get full results
			if (live) {
				// keep results from the full load; refresh counters + statuses
				const byID = Object.fromEntries(data.proposals.map((p) => [p.id, p]));
				proposals = proposals.map((p) => (byID[p.id] ? { ...p, voteCount: byID[p.id].voteCount ?? p.voteCount } : p));
			} else {
				proposals = data.proposals;
				attendance = data.attendance || {};
				onresults(proposals.filter((p) => p.status === 'closed'));
			}
			loaded = true;
			loadError = '';
		} catch {
			loadError = 'Could not load the ballot. Check your connection.';
		}
		schedule();
	};

	// poll quickly while something is open, slowly otherwise
	const schedule = () => {
		clearTimeout(timer);
		const anyOpen = proposals.some((p) => p.status === 'open' || p.status === 'tie');
		timer = setTimeout(() => load(true), anyOpen ? 4000 : 30000);
	};

	onMount(async () => {
		meID = ls.get('ccManager');
		if (meID) meCode = ls.get(`bioCode:${meID}`);
		const saved = ls.get('bioCode:commissioner');
		if (saved) {
			try {
				await api({ action: 'check', code: saved });
				commish = true;
				commishCode = saved;
			} catch {
				/* stale code */
			}
		}
		await load(false);
		loadMyVotes();
	});

	onDestroy(() => clearTimeout(timer));

	const loadMyVotes = async () => {
		if (!meID || !meCode) return;
		for (const p of proposals.filter((x) => x.status === 'open')) {
			try {
				const r = await api({ action: 'myvote', managerID: meID, code: meCode, proposalID: p.id });
				myVotes = { ...myVotes, [p.id]: r.choice };
			} catch {
				/* wrong code: they'll see it when voting */
			}
		}
	};

	const pickMe = () => {
		ls.set('ccManager', meID);
		meCode = ls.get(`bioCode:${meID}`);
		myVotes = {};
		loadMyVotes();
	};

	const vote = async (p, choice) => {
		if (!meID) {
			voteError = { ...voteError, [p.id]: 'Pick your name first.' };
			return;
		}
		if (!meCode.trim()) {
			voteError = { ...voteError, [p.id]: 'Enter your code first.' };
			return;
		}
		voting = { ...voting, [p.id]: true };
		voteError = { ...voteError, [p.id]: '' };
		try {
			const r = await api({ action: 'vote', managerID: meID, code: meCode, proposalID: p.id, choice });
			myVotes = { ...myVotes, [p.id]: r.choice };
			proposals = proposals.map((x) => (x.id === p.id ? { ...x, voteCount: r.voteCount } : x));
			ls.set(`bioCode:${meID}`, meCode.trim());
			ls.set('ccManager', meID);
		} catch (err) {
			voteError = { ...voteError, [p.id]: err.message };
		}
		voting = { ...voting, [p.id]: false };
	};

	// ----- commissioner -----
	const unlock = async () => {
		unlockError = '';
		try {
			await api({ action: 'check', code: unlockInput });
			commish = true;
			commishCode = unlockInput.trim();
			ls.set('bioCode:commissioner', commishCode);
			showUnlock = false;
			unlockInput = '';
		} catch (err) {
			unlockError = err.message;
		}
	};

	const lock = () => {
		commish = false;
		commishCode = '';
		ls.del('bioCode:commissioner');
	};

	const act = async (action, extra = {}) => {
		busy = true;
		actionError = '';
		try {
			await api({ action, code: commishCode, ...extra });
			await load(false);
		} catch (err) {
			actionError = err.message;
		}
		busy = false;
	};

	const openOne = (p) => {
		const other = proposals.find((x) => x.status === 'open' && x.id !== p.id);
		if (other) {
			actionError = `Close "${other.title}" first. Voting runs one proposal at a time.`;
			return;
		}
		act('open', { proposalID: p.id });
	};

	const resetForm = () => {
		editing = null;
		fTitle = fDetails = fOptions = fOwner = fRef = fCard = '';
		fType = 'regular';
	};

	const startAdd = () => {
		resetForm();
		showForm = true;
	};

	const startEdit = (p) => {
		editing = p.id;
		fTitle = p.title;
		fDetails = p.details || '';
		fType = p.type;
		fOptions = p.type === 'regular' && !(p.options[0] === 'Yes' && p.options[1] === 'No' && p.options.length === 2) ? p.options.join('\n') : '';
		fOwner = p.owner || '';
		fRef = p.ref || '';
		fCard = p.cardId || '';
		showForm = true;
	};

	const fromCard = () => {
		const c = cards.find((x) => String(x.id) === String(fCard));
		if (!c) return;
		fTitle = c.parsed?.base || c.title;
		fOptions = (c.parsed?.options || []).join('\n');
		fOwner = c.owner || '';
		fRef = c.notes || '';
		if (/dues/i.test(c.title)) fType = 'dues';
		else if (/scor/i.test(c.title)) fType = 'scoring';
		else fType = 'regular';
	};

	const submitForm = async () => {
		const options = fType === 'regular' ? fOptions.split('\n').map((s) => s.trim()).filter(Boolean) : [];
		await act(editing ? 'update' : 'create', {
			proposalID: editing,
			title: fTitle,
			details: fDetails,
			type: fType,
			options,
			owner: fOwner,
			ref: fRef,
			cardId: fCard || null,
			season
		});
		if (!actionError) {
			showForm = false;
			resetForm();
		}
	};

	// ----- display helpers -----
	$: ballot = proposals.filter((p) => Number(p.season) === Number(season));
	$: current = ballot.find((p) => p.status === 'open') || ballot.find((p) => p.status === 'tie') || [...ballot].filter((p) => p.status === 'closed').sort((a, b) => (b.closedAt || '').localeCompare(a.closedAt || ''))[0] || null;
	$: votedTonight = (attendance[season] || []).map(personOf).filter(Boolean);

	const statusLabel = (p) => {
		if (p.status === 'draft') return 'Not open yet';
		if (p.status === 'open') return 'Voting open';
		if (p.status === 'tie') return 'Tie';
		if (!p.result) return 'Closed';
		const yesNo = isYesNo(p);
		if (yesNo || p.type !== 'regular') return p.result.passed ? 'Passed' : 'Failed';
		return 'Decided';
	};
	const statusTone = (p) =>
		p.status === 'open' ? 'open' : p.status === 'tie' ? 'tie' : p.status === 'draft' ? 'draft' : p.result?.passed === false ? 'bad' : 'ok';
	const isYesNo = (p) => p.options.length === 2 && p.options[0] === 'Yes' && p.options[1] === 'No';
	const winnerText = (p) => {
		if (!p.result || p.result.winner == null) return '';
		return isYesNo(p) || p.type !== 'regular' ? (p.result.passed ? 'PASSED' : 'FAILED') : p.options[p.result.winner];
	};
	const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

	const enterBig = async () => {
		bigScreen = true;
		await tick();
		try {
			await screenEl?.requestFullscreen?.();
		} catch {
			/* fullscreen not allowed: the overlay still covers the page */
		}
	};
	const exitBig = async () => {
		bigScreen = false;
		try {
			if (document.fullscreenElement) await document.exitFullscreen();
		} catch {
			/* ignore */
		}
	};
</script>

<div class="ballotWrap">
	<div class="sectionHead">
		<h2>Committee Night · {season} Ballot</h2>
		<div class="headBtns">
			<button type="button" class="ghost" onclick={enterBig} disabled={!current}>Big screen</button>
			{#if commish}
				<button type="button" class="gold on" onclick={lock}>Commissioner · Lock</button>
			{:else}
				<button type="button" class="gold" onclick={() => (showUnlock = !showUnlock)}>Commissioner</button>
			{/if}
		</div>
	</div>

	{#if showUnlock && !commish}
		<form class="inline" onsubmit={(e) => { e.preventDefault(); unlock(); }}>
			<input id="ccCommishCode" type="password" autocomplete="off" placeholder="Commissioner code" bind:value={unlockInput} />
			<button type="submit">Unlock</button>
			{#if unlockError}<span class="err">{unlockError}</span>{/if}
		</form>
	{/if}

	<!-- who is voting on this phone -->
	<div class="me">
		<label for="ccMe">Voting as</label>
		<select id="ccMe" bind:value={meID} onchange={pickMe}>
			<option value="">Pick your name…</option>
			{#each people as m}
				<option value={m.id}>{m.name}</option>
			{/each}
		</select>
		<input id="ccMeCode" type="password" autocomplete="off" placeholder="Your code" bind:value={meCode} />
		<span class="meNote">Same code you use to edit your manager page. Votes are secret.</span>
	</div>

	{#if commish}
		<div class="commishBar">
			<button type="button" class="gold on" onclick={startAdd}>+ Add proposal</button>
			<span>Open one proposal at a time. Totals stay hidden until you close it.</span>
		</div>
		{#if actionError}<p class="err block">{actionError}</p>{/if}
		{#if showForm}
			<form class="form" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
				{#if cards.length && !editing}
					<label for="ccCard">Start from a {season} proposal card (optional)</label>
					<select id="ccCard" bind:value={fCard} onchange={fromCard}>
						<option value="">—</option>
						{#each cards as c}
							<option value={String(c.id)}>#{c.id} {c.parsed?.base || c.title}</option>
						{/each}
					</select>
				{/if}
				<label for="ccTitle">Proposal</label>
				<input id="ccTitle" type="text" maxlength="300" bind:value={fTitle} placeholder="e.g. Move the trade deadline to Week 10" />
				<label for="ccDetails">Details (optional)</label>
				<textarea id="ccDetails" rows="2" maxlength="800" bind:value={fDetails}></textarea>
				<label for="ccType">Type (sets what it takes to pass)</label>
				<select id="ccType" bind:value={fType}>
					<option value="regular">Regular · most votes wins</option>
					<option value="scoring">Scoring change · majority + 9 yes</option>
					<option value="dues">Raising dues · 11 yes</option>
				</select>
				{#if fType === 'regular'}
					<label for="ccOptions">Choices, one per line (leave empty for Yes / No)</label>
					<textarea id="ccOptions" rows="3" bind:value={fOptions} placeholder={'Option 1: All trades\nOption 2: Only trades with picks'}></textarea>
				{/if}
				<div class="twoCol">
					<div>
						<label for="ccOwner">Owner (optional)</label>
						<input id="ccOwner" type="text" maxlength="80" bind:value={fOwner} />
					</div>
					<div>
						<label for="ccRef">Constitution section (optional)</label>
						<input id="ccRef" type="text" maxlength="60" bind:value={fRef} placeholder="Section 1.3" />
					</div>
				</div>
				<div class="formBtns">
					<button type="submit" class="gold on" disabled={busy}>{editing ? 'Save changes' : 'Add to ballot'}</button>
					<button type="button" class="ghost" onclick={() => { showForm = false; resetForm(); }}>Cancel</button>
				</div>
			</form>
		{/if}
	{/if}

	{#if !loaded}
		<p class="muted">{loadError || 'Loading the ballot…'}</p>
	{:else if !ballot.length}
		<p class="muted">No proposals on the {season} ballot yet.{commish ? ' Add one above.' : ' The commissioner adds them before Committee Night.'}</p>
	{:else}
		<div class="list">
			{#each ballot as p, i (p.id)}
				<article class="prop {statusTone(p)}">
					<div class="propTop">
						<span class="chip">{statusLabel(p)}</span>
						<span class="rule" title={RULE_TEXT[p.type]?.text}>{RULE_TEXT[p.type]?.label}</span>
						<span class="num">#{i + 1}</span>
					</div>
					<h3>{p.title}</h3>
					{#if p.details}<p class="details">{p.details}</p>{/if}
					<p class="ruleText">{RULE_TEXT[p.type]?.text}{p.ref ? ` · ${p.ref}` : ''}{p.owner ? ` · Owner: ${p.owner}` : ''}</p>

					{#if p.status === 'open'}
						<div class="counter">
							<div class="countTop"><strong>{p.voteCount ?? 0}</strong> of {p.voters} voted</div>
							<div class="bar"><span style="width: {pct(p.voteCount ?? 0, p.voters)}%"></span></div>
						</div>
						<div class="choices">
							{#each p.options as opt, oi}
								<button type="button" class="choice" class:mine={myVotes[p.id] === oi} disabled={voting[p.id]} onclick={() => vote(p, oi)}>
									{opt}
									{#if myVotes[p.id] === oi}<small>Your vote</small>{/if}
								</button>
							{/each}
						</div>
						{#if myVotes[p.id] != null}<p class="muted small">You can change your vote until the commissioner closes it.</p>{/if}
						{#if voteError[p.id]}<p class="err">{voteError[p.id]}</p>{/if}
					{:else if p.result}
						<div class="results">
							{#each p.options as opt, oi}
								<div class="resRow" class:win={p.result.winner === oi} class:tied={p.result.tied?.includes(oi)}>
									<span class="resName">{opt}</span>
									<span class="resBar"><span style="width: {pct(p.result.counts[oi], p.result.total)}%"></span></span>
									<span class="resNum">{p.result.counts[oi]}</span>
								</div>
							{/each}
						</div>
						<p class="verdict">
							{#if p.status === 'tie'}
								<strong>Tie:</strong> commissioner decides
							{:else}
								<strong>{winnerText(p)}</strong> · {p.result.note}{p.result.total ? ` · ${p.result.total} voted` : ''}
							{/if}
						</p>
					{/if}

					{#if commish}
						<div class="controls">
							{#if p.status === 'draft'}
								<button type="button" class="ctl go" disabled={busy} onclick={() => openOne(p)}>Open voting</button>
								<button type="button" class="ctl" disabled={busy} onclick={() => startEdit(p)}>Edit</button>
							{:else if p.status === 'open'}
								<button type="button" class="ctl stop" disabled={busy} onclick={() => act('close', { proposalID: p.id })}>Close voting</button>
							{:else if p.status === 'tie'}
								<span class="tieLabel">Break the tie:</span>
								{#each p.result.tied || [0, 1] as ti}
									<button type="button" class="ctl go" disabled={busy} onclick={() => act('breakTie', { proposalID: p.id, winner: ti })}>{p.options[ti]}</button>
								{/each}
							{/if}
							{#if p.status !== 'draft'}
								<button type="button" class="ctl" disabled={busy} onclick={() => act('reset', { proposalID: p.id })}>Reset vote</button>
							{/if}
							<button type="button" class="ctl" disabled={busy || i === 0} onclick={() => act('move', { proposalID: p.id, dir: -1 })} aria-label="Move up">↑</button>
							<button type="button" class="ctl" disabled={busy || i === ballot.length - 1} onclick={() => act('move', { proposalID: p.id, dir: 1 })} aria-label="Move down">↓</button>
							{#if p.status === 'draft'}
								<button type="button" class="ctl danger" disabled={busy} onclick={() => act('delete', { proposalID: p.id })}>Remove</button>
							{/if}
						</div>
					{/if}
				</article>
			{/each}
		</div>

		{#if votedTonight.length}
			<div class="attend">
				<div class="attendHead">Voted at Committee Night {season} · {votedTonight.length} of {people.length}</div>
				<div class="faces">
					{#each votedTonight as m}
						<span class="face" title={m.name}><img src={m.photo} alt="" />{m.name}</span>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- BIG SCREEN -->
<div class="big" class:show={bigScreen} bind:this={screenEl}>
	{#if bigScreen && current}
		<button type="button" class="bigClose" onclick={exitBig}>Exit big screen</button>
		<div class="bigInner">
			<div class="bigKicker">Committee Night {season} · {RULE_TEXT[current.type]?.label}</div>
			<h2 class="bigTitle">{current.title}</h2>
			{#if current.status === 'open'}
				<div class="bigCount"><strong>{current.voteCount ?? 0}</strong><span>of {current.voters} voted</span></div>
				<div class="bigBar"><span style="width: {pct(current.voteCount ?? 0, current.voters)}%"></span></div>
				<div class="bigChoices">
					{#each current.options as opt}<span>{opt}</span>{/each}
				</div>
				<p class="bigHint">Vote on your phone: Competition Committee page · secret ballot</p>
			{:else if current.result}
				<div class="bigStamp {current.status === 'tie' ? 'tie' : current.result.passed === false ? 'bad' : 'ok'}" class:long={winnerText(current).length > 10}>
					{current.status === 'tie' ? 'TIE' : winnerText(current)}
				</div>
				<div class="bigResults">
					{#each current.options as opt, oi}
						<div class="bigRes" class:win={current.result.winner === oi}>
							<span>{opt}</span><strong>{current.result.counts[oi]}</strong>
						</div>
					{/each}
				</div>
				<p class="bigHint">{current.status === 'tie' ? 'Commissioner decides' : current.result.note}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.ballotWrap {
		margin: 22px 0 8px;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		color: var(--mf-text);
	}

	.sectionHead {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 12px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--mf-line);
	}

	.sectionHead h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		text-shadow: 0 0 18px var(--mf-line-strong);
	}

	.headBtns {
		display: flex;
		gap: 8px;
	}

	button {
		font: inherit;
		cursor: pointer;
	}

	.ghost,
	.gold,
	.inline button,
	.ctl {
		padding: 6px 12px;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-dim);
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
	}

	button:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.gold {
		color: #d9a62e;
		border-color: color-mix(in srgb, #d9a62e 45%, var(--mf-line));
	}

	.gold.on {
		color: #1a1203;
		background: #d9a62e;
	}

	.inline {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}

	input,
	select,
	textarea {
		box-sizing: border-box;
		padding: 7px 10px;
		font: inherit;
		font-size: 0.9rem;
		color: var(--mf-text);
		background: var(--mf-bg);
		border: 1px solid var(--mf-line-strong);
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: var(--mf-ion);
		box-shadow: 0 0 12px -4px var(--mf-ion-glow);
	}

	.me {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		padding: 10px 12px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-left: 3px solid var(--mf-ion);
	}

	.me label {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mf-dim);
	}

	.me input {
		width: 150px;
		letter-spacing: 0.08em;
	}

	.meNote {
		font-family: 'Roboto', sans-serif;
		font-size: 0.76rem;
		color: var(--mf-dim);
	}

	.commishBar {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 12px;
		font-family: 'Roboto', sans-serif;
		font-size: 0.8rem;
		color: var(--mf-dim);
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 12px;
		padding: 14px;
		background: var(--mf-panel);
		border: 1px solid color-mix(in srgb, #d9a62e 40%, var(--mf-line));
	}

	.form label {
		margin-top: 4px;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mf-dim);
	}

	.twoCol {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.twoCol > div {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.formBtns {
		display: flex;
		gap: 8px;
		margin-top: 8px;
	}

	.err {
		margin: 6px 0 0;
		font-size: 0.82rem;
		color: var(--mf-down);
	}

	.err.block {
		margin-top: 10px;
	}

	.muted {
		margin: 14px 0;
		font-style: italic;
		color: var(--mf-dim);
	}

	.muted.small {
		margin: 6px 0 0;
		font-size: 0.76rem;
	}

	.list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
		gap: 12px;
		margin-top: 14px;
	}

	.prop {
		--tone: var(--mf-plasma);
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 14px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--tone);
	}

	.prop.open {
		--tone: var(--mf-ion);
		box-shadow: 0 0 24px -10px var(--mf-ion-glow);
	}

	.prop.ok { --tone: var(--mf-up); }
	.prop.bad { --tone: var(--mf-down); }
	.prop.tie { --tone: #d9a62e; }

	.propTop {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.chip {
		padding: 2px 8px;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--tone);
		border: 1px solid var(--tone);
	}

	.rule {
		font-size: 0.7rem;
		color: var(--mf-dim);
	}

	.num {
		margin-left: auto;
		font-size: 0.74rem;
		color: var(--mf-dim);
	}

	.prop h3 {
		margin: 2px 0 0;
		font-size: 1.05rem;
		line-height: 1.3;
	}

	.details,
	.ruleText {
		margin: 0;
		font-family: 'Roboto', sans-serif;
		font-size: 0.84rem;
		line-height: 1.45;
	}

	.ruleText {
		font-size: 0.74rem;
		color: var(--mf-dim);
	}

	.counter {
		margin-top: 6px;
	}

	.countTop {
		font-size: 0.82rem;
		color: var(--mf-dim);
	}

	.countTop strong {
		font-size: 1.4rem;
		color: var(--mf-ion);
	}

	.bar,
	.resBar,
	.bigBar {
		display: block;
		height: 8px;
		margin-top: 4px;
		background: var(--mf-bg);
		border: 1px solid var(--mf-line);
	}

	.bar span,
	.resBar span,
	.bigBar span {
		display: block;
		height: 100%;
		background: var(--mf-ion);
		box-shadow: 0 0 10px var(--mf-ion-glow);
		transition: width 0.4s ease;
	}

	.choices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
		gap: 8px;
		margin-top: 8px;
	}

	.choice {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 12px 8px;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--mf-text);
		background: var(--mf-panel-2);
		border: 1px solid var(--mf-line-strong);
	}

	.choice:hover:not(:disabled) {
		border-color: var(--mf-ion);
	}

	.choice.mine {
		color: var(--mf-on-ion);
		background: var(--mf-ion);
		border-color: var(--mf-ion);
	}

	.choice small {
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.results {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 6px;
	}

	.resRow {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 1.2fr 28px;
		align-items: center;
		gap: 8px;
		font-size: 0.84rem;
	}

	.resRow .resBar {
		margin: 0;
	}

	.resRow:not(.win) .resBar span {
		background: var(--mf-plasma);
		box-shadow: none;
	}

	.resRow.win .resName {
		font-weight: 700;
	}

	.resNum {
		text-align: right;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.verdict {
		margin: 6px 0 0;
		font-size: 0.82rem;
		color: var(--mf-dim);
	}

	.verdict strong {
		color: var(--tone);
		letter-spacing: 0.06em;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 8px;
		padding-top: 10px;
		border-top: 1px dashed var(--mf-line);
	}

	.ctl.go {
		color: var(--mf-on-ion);
		background: var(--mf-ion);
		border-color: var(--mf-ion);
	}

	.ctl.stop {
		color: #fff;
		background: var(--mf-down);
		border-color: var(--mf-down);
	}

	.ctl.danger {
		margin-left: auto;
		color: var(--mf-down);
	}

	.tieLabel {
		align-self: center;
		font-size: 0.76rem;
		color: #d9a62e;
	}

	.attend {
		margin-top: 14px;
		padding: 12px 14px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
	}

	.attendHead {
		margin-bottom: 8px;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mf-dim);
	}

	.faces {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.face {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 3px 8px 3px 3px;
		font-size: 0.78rem;
		background: var(--mf-panel-2);
		border: 1px solid var(--mf-line);
	}

	.face img {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		object-fit: cover;
	}

	/* ---------- big screen ---------- */
	.big {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: none;
		align-items: center;
		justify-content: center;
		padding: 40px max(24px, env(safe-area-inset-right, 0px)) 40px max(24px, env(safe-area-inset-left, 0px));
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		color: var(--mf-text);
		background:
			linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 40px,
			linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 40px 100%,
			radial-gradient(ellipse at 50% 20%, color-mix(in srgb, var(--mf-ion) 16%, transparent), transparent 60%),
			var(--mf-bg);
	}

	.big.show {
		display: flex;
	}

	.bigClose {
		position: absolute;
		top: max(16px, env(safe-area-inset-top, 0px));
		right: max(16px, env(safe-area-inset-right, 0px));
		padding: 6px 12px;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-dim);
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
	}

	.bigInner {
		width: min(1100px, 100%);
		text-align: center;
	}

	.bigKicker {
		font-size: clamp(0.8rem, 1.6vw, 1.1rem);
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--mf-dim);
	}

	.bigTitle {
		margin: 14px 0 26px;
		font-size: clamp(1.8rem, 5vw, 3.6rem);
		line-height: 1.1;
		text-wrap: balance;
		text-shadow: 0 0 24px var(--mf-line-strong);
	}

	.bigCount strong {
		display: block;
		font-size: clamp(5rem, 16vw, 11rem);
		line-height: 1;
		color: var(--mf-ion);
		text-shadow: 0 0 40px var(--mf-ion-glow);
		font-variant-numeric: tabular-nums;
	}

	.bigCount span {
		font-size: clamp(1rem, 2.4vw, 1.6rem);
		color: var(--mf-dim);
	}

	.bigBar {
		width: min(700px, 90%);
		height: 14px;
		margin: 22px auto 0;
	}

	.bigChoices {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 26px;
	}

	.bigChoices span {
		padding: 8px 18px;
		font-size: clamp(1rem, 2vw, 1.4rem);
		border: 1px solid var(--mf-line-strong);
		background: var(--mf-panel);
	}

	.bigHint {
		margin-top: 22px;
		font-size: clamp(0.85rem, 1.6vw, 1.1rem);
		color: var(--mf-dim);
	}

	.bigStamp {
		display: inline-block;
		padding: 10px 34px;
		font-size: clamp(3rem, 11vw, 8rem);
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.06em;
		color: var(--stamp);
		border: 6px solid var(--stamp);
		box-shadow: 0 0 40px -6px var(--stamp);
		animation: stamp 0.45s cubic-bezier(0.2, 1.4, 0.4, 1) both;
	}

	.bigStamp.long {
		max-width: 100%;
		padding: 14px 26px;
		font-size: clamp(1.8rem, 5.5vw, 4.2rem);
		line-height: 1.1;
		text-wrap: balance;
	}

	.bigStamp.ok { --stamp: var(--mf-up); }
	.bigStamp.bad { --stamp: var(--mf-down); }
	.bigStamp.tie { --stamp: #d9a62e; }

	@keyframes stamp {
		from { transform: scale(1.6) rotate(-6deg); opacity: 0; }
		to { transform: scale(1) rotate(-3deg); opacity: 1; }
	}

	.bigResults {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 14px;
		margin-top: 30px;
	}

	.bigRes {
		display: flex;
		flex-direction: column;
		min-width: 140px;
		padding: 12px 18px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
	}

	.bigRes span {
		font-size: clamp(0.9rem, 1.8vw, 1.2rem);
		color: var(--mf-dim);
	}

	.bigRes strong {
		font-size: clamp(2rem, 5vw, 3.4rem);
		font-variant-numeric: tabular-nums;
	}

	.bigRes.win {
		border-color: var(--mf-ion);
		box-shadow: 0 0 24px -8px var(--mf-ion-glow);
	}

	@media (max-width: 560px) {
		.twoCol {
			grid-template-columns: 1fr;
		}
		.me input,
		.me select {
			flex: 1 1 140px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bigStamp {
			animation: none;
		}
	}
</style>
