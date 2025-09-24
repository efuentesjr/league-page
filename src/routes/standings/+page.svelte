<script>
  import { onMount } from 'svelte';
  import { Standings } from '$lib/components';

  export let data;

  // Locals to hold the resolved values
  let standingsResolved = null;
  let ltmResolved = null; // leagueTeamManagersData resolved

  onMount(async () => {
    try {
      // In case they are already plain values, Promise.resolve() is harmless
      const [s, ltm] = await Promise.all([
        Promise.resolve(data?.standingsData),
        Promise.resolve(data?.leagueTeamManagersData)
      ]);

      standingsResolved = s;
      ltmResolved = ltm;

      // --- Diagnostic table (same as before, but now using resolved data) ---
      const list = Array.isArray(ltmResolved) ? ltmResolved : [];
      if (!list.length) {
        console.warn('[diag] standings page: leagueTeamManagersData is empty after resolve');
        return;
      }
      const rows = list.map(t => ({
        teamId: Number(t.teamId ?? t.team_id ?? t.roster_id ?? t.rosterId ?? NaN),
        teamName: String(t.teamName ?? t.team_name ?? '').trim(),
        managerName: String(t.managerName ?? t.manager_name ?? t.name ?? '').trim(),
        teamNameMissing: !(t.teamName ?? t.team_name ?? '').trim(),
        looksLikeManagerShown:
          !(t.teamName ?? t.team_name ?? '').trim() ||
          String(t.teamName ?? t.team_name ?? '').trim() === String(t.managerName ?? t.manager_name ?? t.name ?? '').trim()
      }));
      console.group('[diag] leagueTeamManagersData summary (Standings, resolved)');
      console.table(rows);
      console.groupEnd();
    } catch (e) {
      console.error('[diag] failed to resolve data on standings page', e);
    }
  });
</script>

<style>
  .holder { position: relative; z-index: 1; text-align: center; }
</style>

{#if !standingsResolved || !ltmResolved}
  <div class="holder">Loading…</div>
{:else}
  <div class="holder">
    <Standings standingsData={standingsResolved} leagueTeamManagersData={ltmResolved} />
  </div>
{/if}
