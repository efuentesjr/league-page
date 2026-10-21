<script>
	import { resolvedNav } from '$lib/utils/tabs';
	import Drawer, {
	  Content,
	  Header,
	  Title,
	} from '@smui/drawer';
	import { Icon } from '@smui/tab';
  	import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';
	import { goto, preloadData } from '$app/navigation';
    import { page } from '$app/state';
	import { leagueName } from '$lib/utils/helper';
	import { enableBlog, managers } from '$lib/utils/leagueInfo';

	let active = $state(page.url.pathname);

	let open = $state(false);

	const selectTab = (tab) => {
		open = false;
		active = tab.dest;
		goto(tab.dest);
	}
</script>

<style>
	:global(.menuIcon) {
		position: absolute;
		top: 15px;
		left: 15px;
		font-size: 2em;
		color: var(--mf-dim);
		padding: 6px;
		cursor: pointer;
	}

	:global(.menuIcon:hover) {
		color: var(--mf-ion);
	}

	:global(.nav-drawer) {
		z-index: 9;
		top: 0;
		left: 0;
	}

	:global(.nav-item) {
		color: var(--mf-dim) !important;
	}

	.nav-back {
		position: fixed;
		z-index: 8;
		width: 100%;
		width: 100vw;
		height: 100%;
		height: 100vh;
		top: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.32);
		transition: all 0.7s;
	}
</style>

<Icon class="material-icons menuIcon" onclick={() => open = true} ripple={false} touch={true}>menu</Icon>

<div class="nav-back" style="pointer-events: {open ? "visible" : "none"}; opacity: {open ? 1 : 0};" onclick={() => open = false}></div>

<Drawer variant="modal" class="nav-drawer" fixed={true} bind:open>
	<Header>
		<Title>{leagueName}</Title>
	</Header>
	<Content>
		<List>
			{#each resolvedNav as item, gi}
				{#if item.single}
					<Item href="javascript:void(0)" onSMUIAction={() => item.external ? window.open(item.dest, '_blank') : selectTab(item)} activated={active == item.dest}>
						<Graphic class="material-icons{active == item.dest ? "" : " nav-item"}" aria-hidden="true">{item.icon}</Graphic>
						<Text class="{active == item.dest ? "" : "nav-item"}">{item.label}</Text>
					</Item>
				{:else}
					<Separator />
					<Subheader>{item.label}</Subheader>
					{#each item.children as subTab}
						<Item href="javascript:void(0)" onSMUIAction={() => selectTab(subTab)} activated={active == subTab.dest} ontouchstart={() => preloadData(subTab.dest)} onmouseover={() => preloadData(subTab.dest)}>
							<Graphic class="material-icons{active == subTab.dest ? "" : " nav-item"}" aria-hidden="true">{subTab.icon}</Graphic>
							<Text class="{active == subTab.dest ? "" : "nav-item"}">{subTab.label}</Text>
						</Item>
					{/each}
					{#if resolvedNav[gi + 1]?.single}<Separator />{/if}
				{/if}
			{/each}
		</List>
	</Content>
  </Drawer>
	
