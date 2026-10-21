<script>
	import { resolvedNav } from '$lib/utils/tabs';
	import { page } from '$app/state';
	import { preloadData } from '$app/navigation';

	let openGroup = $state(null);

	const path = $derived(page.url.pathname);
	const isActive = (item) =>
		item.single ? item.dest === path : item.children.some((c) => c.dest === path);

	const toggle = (label) => (openGroup = openGroup === label ? null : label);
	const close = () => (openGroup = null);
	const preload = (tab) => { if (!tab.external) preloadData(tab.dest); };

	// close when the route changes
	$effect(() => { path; close(); });
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<style>
	.navRow {
		display: flex;
		justify-content: center;
		align-items: stretch;
		gap: 2px;
		padding: 0 12px;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
	}

	.item {
		position: relative;
	}

	.navLink {
		display: flex;
		align-items: center;
		gap: 7px;
		height: 50px;
		padding: 0 13px;
		font: inherit;
		font-size: 0.86rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--mf-dim);
		background: none;
		border: 0;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		white-space: nowrap;
		transition: color 0.15s ease, border-color 0.15s ease;
	}

	.navLink .material-icons {
		font-size: 1.35em;
	}

	.navLink:hover,
	.navLink:focus-visible,
	.item.open > .navLink {
		color: var(--mf-text);
		outline: none;
	}

	.navLink:focus-visible {
		box-shadow: inset 0 0 0 2px var(--mf-ion);
	}

	.item.active > .navLink {
		color: var(--mf-ion);
		border-bottom-color: var(--mf-ion);
		text-shadow: 0 0 10px var(--mf-ion-glow);
	}

	.caret {
		font-size: 0.7em;
		transition: transform 0.15s ease;
	}

	.item.open .caret {
		transform: rotate(180deg);
	}

	.menu {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		min-width: 230px;
		z-index: 20;
		padding: 6px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line-strong);
		border-top: 2px solid var(--mf-ion);
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45), 0 0 14px var(--mf-ion-glow);
	}

	.menu a {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--mf-text);
		text-decoration: none;
		white-space: nowrap;
	}

	.menu a .material-icons {
		font-size: 1.25em;
		color: var(--mf-dim);
	}

	.menu a:hover,
	.menu a:focus-visible {
		background: var(--mf-panel-2);
		outline: none;
	}

	.menu a.current {
		color: var(--mf-ion);
		box-shadow: inset 2px 0 0 var(--mf-ion);
	}

	.menu a.current .material-icons {
		color: var(--mf-ion);
	}

	.scrim {
		position: fixed;
		inset: 0;
		z-index: 10;
	}
</style>

{#if openGroup}
	<div class="scrim" role="presentation" onclick={close}></div>
{/if}

<div class="navRow">
	{#each resolvedNav as item}
		<div class="item" class:active={isActive(item)} class:open={openGroup === item.label}>
			{#if item.single}
				<a
					class="navLink"
					href={item.dest}
					target={item.external ? '_blank' : undefined}
					rel={item.external ? 'noopener' : undefined}
					onmouseover={() => preload(item)}
					onfocus={() => preload(item)}
				>
					<span class="material-icons" aria-hidden="true">{item.icon}</span>
					{item.key === 'sleeper' ? 'Sleeper' : item.label}
				</a>
			{:else}
				<button
					type="button"
					class="navLink"
					aria-expanded={openGroup === item.label}
					aria-haspopup="true"
					onclick={() => toggle(item.label)}
				>
					<span class="material-icons" aria-hidden="true">{item.icon}</span>
					{item.label}
					<span class="caret" aria-hidden="true">▾</span>
				</button>
				{#if openGroup === item.label}
					<div class="menu" role="menu">
						{#each item.children as child}
							<a
								role="menuitem"
								href={child.dest}
								class:current={child.dest === path}
								onmouseover={() => preload(child)}
								onclick={close}
							>
								<span class="material-icons" aria-hidden="true">{child.icon}</span>
								{child.label}
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/each}
</div>
