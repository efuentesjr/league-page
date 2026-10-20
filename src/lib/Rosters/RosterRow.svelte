<script>
	export let player;

	const playerSLotClass = player.slot.replace('/', '').replace('SUPER_', 'S-').replace('REC_', 'R-');
	const playerSlot = player.slot.replace('SUPER_', 'S ').replace('REC_', 'R ');
	const empty = player.name == 'Empty';
</script>

<style>
	.row {
		--posColor: var(--mf-dim);
		display: grid;
		grid-template-columns: 54px 44px minmax(0, 1fr);
		align-items: center;
		gap: 10px;
		min-height: 48px;
		padding-right: 12px;
		box-sizing: border-box;
		background:
			linear-gradient(90deg, color-mix(in srgb, var(--posColor) 16%, transparent), transparent 45%),
			var(--mf-panel);
		border-bottom: 1px solid var(--mf-line);
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		transition: background-color 0.15s ease;
	}

	.row:hover {
		background-color: var(--mf-panel-2);
	}

	.row.empty {
		grid-template-columns: 54px minmax(0, 1fr);
	}

	/* slot chip: angled slab in the slot's colors (same shape as the home rank chip) */
	.pos {
		align-self: stretch;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-right: 6px;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
		background: var(--BN);
		white-space: nowrap;
	}

	.QB { background: linear-gradient(160deg, var(--QB), color-mix(in srgb, var(--QB) 45%, #000)); }
	.WR { background: linear-gradient(160deg, var(--WR), color-mix(in srgb, var(--WR) 45%, #000)); }
	.RB { background: linear-gradient(160deg, var(--RB), color-mix(in srgb, var(--RB) 45%, #000)); }
	.TE { background: linear-gradient(160deg, var(--TE), color-mix(in srgb, var(--TE) 45%, #000)); }
	.K { background: var(--K); }
	.DEF { background: var(--DEF); color: #222; text-shadow: none; }
	.DL { background: var(--DL); }
	.LB { background: var(--LB); }
	.DB { background: var(--DB); }
	.FLEX { background: linear-gradient(160deg, var(--WR), var(--WR) 33%, var(--RB) 33%, var(--RB) 66%, var(--TE) 66%); }
	.WRRB { background: linear-gradient(160deg, var(--WR), var(--WR) 50%, var(--RB) 50%); }
	.S-FLEX { background: linear-gradient(160deg, var(--WR), var(--WR) 25%, var(--RB) 25%, var(--RB) 50%, var(--TE) 50%, var(--TE) 75%, var(--QB) 75%); }
	.R-FLEX { background: linear-gradient(160deg, var(--WR), var(--WR) 50%, var(--TE) 50%); }
	.IDP { background: linear-gradient(160deg, var(--DL), var(--DL) 33%, var(--LB) 33%, var(--LB) 66%, var(--DB) 66%); }
	.BN {
		background: linear-gradient(160deg, color-mix(in srgb, var(--mf-ion) 35%, var(--mf-panel-2)), var(--mf-panel-2));
		color: var(--mf-text);
	}

	.playerAvatar {
		position: relative;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background-color: var(--mf-panel-2);
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		border: 1px solid var(--posColor);
		box-shadow: 0 0 6px color-mix(in srgb, var(--posColor) 45%, transparent);
	}

	.teamLogo {
		position: absolute;
		width: 18px;
		height: 18px;
		right: -7px;
		bottom: -4px;
		border-radius: 50%;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		padding: 1px;
		box-sizing: border-box;
	}

	.info {
		min-width: 0;
		padding: 5px 0;
	}

	.name {
		font-size: 0.92rem;
		font-weight: 600;
		line-height: 1.15;
		color: var(--mf-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.emptyName {
		color: var(--mf-dim);
		font-style: italic;
		font-weight: 500;
	}

	.additionalInfo {
		margin-top: 2px;
		font-size: 0.72rem;
		color: var(--mf-dim);
		letter-spacing: 0.02em;
	}

	.posText {
		font-weight: 700;
		color: var(--posColor);
	}

	.nickname {
		display: block;
		color: var(--mf-dim);
		font-style: italic;
		font-size: 0.72rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* injury tags (rendered inside the name HTML) */
	.row :global(.injury) {
		display: inline-block;
		margin-left: 6px;
		padding: 0 4px;
		font-size: 0.65rem;
		font-weight: 700;
		font-style: normal;
		line-height: 1.4;
		vertical-align: 2px;
		border: 1px solid currentColor;
	}

	.row :global(.Q) { color: #e0b03a; }
	.row :global(.OUT),
	.row :global(.IR),
	.row :global(.PUP) { color: var(--mf-down); }

	@media (max-width: 360px) {
		.row {
			grid-template-columns: 46px 38px minmax(0, 1fr);
			gap: 8px;
		}
		.row.empty {
			grid-template-columns: 46px minmax(0, 1fr);
		}
		.pos {
			font-size: 0.7rem;
		}
		.playerAvatar {
			width: 34px;
			height: 34px;
		}
	}
</style>

<div class="row" class:empty style={player.poss ? `--posColor: var(--${player.poss}, var(--mf-dim))` : ''}>
	<span class="pos {playerSLotClass}">{playerSlot}</span>
	{#if !empty && player.avatar}
		<div class="playerAvatar" style={player.avatar}>
			{#if player.team && player.poss != 'DEF'}
				<img src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" class="teamLogo" alt="" />
			{/if}
		</div>
	{/if}
	<div class="info">
		{#if empty}
			<div class="name emptyName">Empty</div>
		{:else}
			<div class="name">{@html player.name}</div>
			{#if player.poss !== 'DEF'}
				<div class="additionalInfo">
					<span class="posText">{player.poss}</span>{#if player.team} · {player.team}{/if}
				</div>
			{/if}
			{#if player.nickname}
				<span class="nickname">"{player.nickname}"</span>
			{/if}
		{/if}
	</div>
</div>
