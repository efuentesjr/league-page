<script>
  export let data;
  import { onMount } from 'svelte';
  let NavComp = null;
</script>

<slot />

{#if NavComp}
  <svelte:component this={NavComp} />
{/if}

<script>
  onMount(async () => {
    // Make sure the path & filename casing match your repo exactly
    NavComp = (await import('$lib/components/Nav.svelte')).default;
  });
</script>
