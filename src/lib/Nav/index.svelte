<script>
	import NavSmall from './NavSmall.svelte';
	import NavLarge from './NavLarge.svelte';
    import { page } from '$app/state';
	import IconButton from '@smui/icon-button';
	import { Icon } from '@smui/common';

	// toggle dark mode
	let darkTheme = $state(typeof window === "undefined" || window.matchMedia("(prefers-color-scheme: dark)").matches);
	function switchTheme(currentTheme) {
		currentTheme = !currentTheme;
		let themeLink = document.head.querySelector("#theme");
		if (!themeLink) {
			themeLink = document.createElement("link");
			themeLink.rel = "stylesheet";
			themeLink.id = "theme";
		}
		themeLink.href = `/smui${currentTheme ? "" : "-dark"}.css`;
		document.head
		.querySelector('link[href="/smui-dark.css"]')
		.insertAdjacentElement("afterend", themeLink);
	}
</script>

<svelte:head>
	<title>{!page.url.pathname[1] ? 'Home' : page.url.pathname[1].toUpperCase() + page.url.pathname.slice(2)} | League Page</title>
</svelte:head>

<style>
	a {
		display: table;
    	margin: 0 auto;
	}
	nav {
		background:
			radial-gradient(ellipse 60% 120% at 50% 0%, color-mix(in srgb, var(--mf-plasma) 18%, transparent), transparent 70%),
			var(--mf-panel);
		position: relative;
		z-index: 2;
		border-bottom: 1px solid var(--mf-line-strong);
		box-shadow: 0 2px 18px -4px var(--mf-ion-glow);
	}

	#logo {
		filter: drop-shadow(0 0 10px var(--mf-ion-glow));
	}

	/* active tab: lit in ion cyan */
	nav :global(.mdc-tab--active .mdc-tab__text-label),
	nav :global(.mdc-tab--active .mdc-tab__icon) {
		color: var(--mf-ion);
		text-shadow: 0 0 10px var(--mf-ion-glow);
	}

	nav :global(.mdc-tab-indicator__content--underline) {
		border-color: var(--mf-ion);
		box-shadow: 0 0 8px var(--mf-ion);
	}

	nav :global(.mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label),
	nav :global(.mdc-tab:not(.mdc-tab--active) .mdc-tab__icon) {
		color: var(--mf-dim);
	}

	nav :global(.mdc-tab:hover .mdc-tab__text-label),
	nav :global(.mdc-tab:hover .mdc-tab__icon) {
		color: var(--mf-text);
	}

	#logo {
		width: 80px;
		display: block;
		margin: 0 auto;
		padding: 10px;
	}

    .large {
		display: block;
    }

	.small {
		display: none;
	}

	.container {
		position: absolute;
		top: 0.25em;
		right: 0.25em;
	}

	:global(.lightDark) {
		color: var(--mf-dim)
	}

	@media (max-width: 950px) { /* width of the large navBar */
		.large {
			display: none;
		}

		.small {
			display: block;
		}
	}
</style>

<nav>
	<a href="/"><img id="logo" alt="league logo" src="/badge.png" /></a>

	<div class="container">
		<IconButton
			toggle
			bind:pressed={darkTheme}
			onclick={() => switchTheme(darkTheme)}
			class="lightDark"
		>
			<Icon class="material-icons" on>dark_mode</Icon>
			<Icon class="material-icons">light_mode</Icon>
		</IconButton>
	</div>

	<div class="large">
		<NavLarge />
	</div>

	<div class="small">
		<NavSmall />
	</div>

</nav>
