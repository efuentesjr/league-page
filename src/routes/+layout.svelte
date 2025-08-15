<!-- __layout.svelte --> 
<script>
  export let data;
  import { onMount } from 'svelte';

  let NavComp = null; // will hold the loaded component
</script>

<!-- Page content first -->
<slot />

<!-- Nav will appear after mount -->
{#if NavComp}
  <svelte:component this={NavComp} />
{/if}

<script>
  onMount(async () => {
    // dynamic import avoids SSR loading (where window/document aren’t available)
    NavComp = (await import('$lib/components/Nav.svelte')).default;
  });
</script>
