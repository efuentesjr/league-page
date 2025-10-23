<script lang="ts">
  // Make this page safe for static builds
  export const prerender = true;

  type Proposal = {
    id: number;
    title: string;
    owner: string;
    notes?: string;     // e.g., "Section 7.2, 7.3"
    status?: 'NEW' | 'OPEN' | 'CARRIED' | 'REJECTED' | 'TABLED';
    // Optional “options” if a proposal has multiple variants to consider
    options?: { label: string; detail?: string }[];
  };

  type Outcome = {
    id: number | string;
    title: string;
    ruleDeadline?: string | number; // year or text
    notes?: string;
  };

  // ====== DATA ======
  // Fill these with your exact items (I pre-seeded a few from your screenshot; adjust freely).
  const proposals: Proposal[] = [
    {
      id: 1,
      title: 'Review bookkeeping (dues, winnings, etc.)',
      owner: 'Commish',
      notes: 'Section 7.2, 7.3',
      status: 'OPEN'
    },
    {
      id: 2,
      title: 'Review player scoring',
      owner: 'Commish',
      notes: 'Section 4.1',
      status: 'OPEN'
    },
    {
      id: 3,
      title: 'Draw for draft order',
      owner: 'League',
      status: 'OPEN'
    },
    {
      id: 4,
      title:
        'Allow teams to purchase a Draft “ping-pong” entry for the #1 spot via FAAB',
      owner: 'Ray Rodriguez',
      status: 'OPEN',
      options: [
        { label: 'Option A', detail: 'Allow one team; auction winner gets one entry.' },
        { label: 'Option B', detail: 'Only non-playoff teams eligible.' }
      ]
    },
    {
      id: 5,
      title:
        'Allow teams to purchase FAAB rights to select their division when joining as a new team',
      owner: 'Eddie Fuentes / Ray Rodriguez',
      status: 'NEW'
    },
    {
      id: 6,
      title:
        'Run draft in an auction-type bidding format (discussion)',
      owner: 'Commish',
      status: 'OPEN'
    },
    {
      id: 7,
      title:
        'Tag Top (3?) players for no-trade back off “Pro Bowlers” list; reduce counts (e.g., 6 RBs, 2 QBs, WRs 25, TEs 10)',
      owner: 'Commish',
      notes: 'Section 13.2',
      status: 'OPEN'
    },
    {
      id: 8,
      title:
        'Punt returners: only get points for TDs? Voting on “allow points for yards for punt returner”',
      owner: 'John Diaz-Decaro',
      notes: 'Section 4.1',
      status: 'OPEN'
    },
    {
      id: 9,
      title:
        'Raising Dues: 2/3 majority vote required to raise league dues; review budget and vote on raising dues from $75 → $85',
      owner: 'Commish',
      notes: 'Section 7.3',
      status: 'OPEN'
    },
    {
      id: 10,
      title:
        'Conditional trades: define what’s allowed/not allowed (limit on picks & FAAB, no trade-back on all players involved, if a trade involves picks only it must be offered to entire league, etc.)',
      owner: 'Trey Fuentes',
      notes: 'Section 13',
      status: 'OPEN'
    },
    {
      id: 11,
      title:
        'Open forum: bring up anything that feels unfair or not giving a fair chance; we can check rules that affect the issue',
      owner: 'Commish',
      status: 'OPEN'
    }
  ];

  const previous: Outcome[] = [
    {
      id: 'P1',
      title:
        'Tag Top (3) players for no-trade back off “Pro Bowlers” list',
      ruleDeadline: 2025,
      notes: 'Consider reducing to top 20 or 25.'
    },
    {
      id: 'P2',
      title:
        'Enable “Best Roster” filling during playoffs to preserve integrity of draft pick trades',
      ruleDeadline: 2025,
      notes: 'Decision: No'
    },
    {
      id: 'P3',
      title:
        'Starting, Bench, Taxi & IR spots settings',
      ruleDeadline: 2025,
      notes: '3 | 10 | 3 | 4'
    },
    {
      id: 'P4',
      title:
        'Taxi Squad settings; move-in/out',
      ruleDeadline: 2025,
      notes:
        'Rookies can be moved back in; adjust to beginning of Week before Thursday’s game (or mid-season checkpoint).'
    },
    {
      id: 'P5',
      title:
        'Trading deadline moved to Week 7',
      ruleDeadline: 2026,
      notes: 'Point of season cut-off.'
    },
    {
      id: 'P6',
      title:
        'Divisions: make sense schedule-wise each round',
      ruleDeadline: 2026,
      notes: 'Discussed; review for reshuffling and tiebreak print.'
    },
    {
      id: 'P7',
      title: 'Toilet Bowl rules',
      ruleDeadline: 2026
    },
    {
      id: 'P8',
      title:
        'Top support: the incoming manager’s team will get priority for #1 pick (or slot?) via tiebreak/lottery',
      ruleDeadline: 2027
    },
    {
      id: 'P9',
      title:
        "Loser's punishment: 2 strikes you're out rule; team will be placed on final notice/section",
      ruleDeadline: 2027
    },
    {
      id: 'P10',
      title:
        'Reshuffle divisions every 4 years',
      ruleDeadline: 2027,
      notes: 'Next reshuffling 2028 off-season.'
    }
  ];

  // ====== UI STATE (filters & expand) ======
  let q = '';                // quick search
  let ownerFilter = 'All';
  let statusFilter: 'All' | Proposal['status'] = 'All';
  const owners = ['All', ...Array.from(new Set(proposals.map(p => p.owner)))];
  const statuses: Array<'All' | Proposal['status']> = ['All', 'NEW', 'OPEN', 'CARRIED', 'REJECTED', 'TABLED'];

  const matches = (p: Proposal) => {
    const text = (p.title + ' ' + (p.notes ?? '') + ' ' + p.owner).toLowerCase();
    const okQ = !q || text.includes(q.toLowerCase());
    const okOwner = ownerFilter === 'All' || p.owner === ownerFilter;
    const okStatus = statusFilter === 'All' || p.status === statusFilter;
    return okQ && okOwner && okStatus;
  };

  let expanded = new Set<number>();
  const toggle = (id: number) => {
    expanded.has(id) ? expanded.delete(id) : expanded.add(id);
    // trigger reactive update
    expanded = new Set(expanded);
  };
</script>

<svelte:head>
  <title>Competition Committee</title>
  <meta name="description" content="Proposals, votes, and historical outcomes for the MFFL Competition Committee." />
</svelte:head>

<section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <header class="mb-8">
    <h1 class="text-3xl font-semibold tracking-tight">Competition Committee</h1>
    <p class="text-sm text-neutral-600 mt-1">
      Review active proposals, discuss options, and track outcomes from prior years.
    </p>
  </header>

  <!-- Filters -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
    <input
      class="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400"
      placeholder="Search proposals (title, notes, owner)"
      bind:value={q}
    />

    <select
      class="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400"
      bind:value={ownerFilter}
    >
      {#each owners as o}
        <option value={o}>{o}</option>
      {/each}
    </select>

    <select
      class="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400"
      bind:value={statusFilter}
    >
      {#each statuses as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
  </div>

  <!-- Active Proposals -->
  <div class="bg-white rounded-2xl shadow p-4 sm:p-6 mb-10">
    <div class="flex items-center gap-2 mb-4">
      <span class="material-icons">gavel</span>
      <h2 class="text-xl font-semibold">Rule Change / Discussion</h2>
    </div>

    <ul class="divide-y divide-neutral-200">
      {#each proposals.filter(matches) as p}
        <li class="py-4">
          <div class="flex items-start gap-3">
            <div class="mt-1 text-neutral-400 select-none w-6 text-right pr-1">{p.id}</div>
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-medium">{p.title}</h3>
                {#if p.status}
                  <span class="text-xs px-2 py-0.5 rounded-full border"
                    class:text-neutral-800={p.status === 'NEW'}
                    class:bg-yellow-50={p.status === 'NEW'}
                    class:border-yellow-200={p.status === 'NEW'}
                    class:text-neutral-700={p.status === 'OPEN'}
                    class:bg-neutral-50={p.status === 'OPEN'}
                    class:border-neutral-200={p.status === 'OPEN'}
                    class:bg-green-50={p.status === 'CARRIED'}
                    class:border-green-200={p.status === 'CARRIED'}
                    class:text-green-700={p.status === 'CARRIED'}
                    class:bg-red-50={p.status === 'REJECTED'}
                    class:border-red-200={p.status === 'REJECTED'}
                    class:text-red-700={p.status === 'REJECTED'}
                    class:bg-orange-50={p.status === 'TABLED'}
                    class:border-orange-200={p.status === 'TABLED'}
                    class:text-orange-700={p.status === 'TABLED'}
                  >
                    {p.status}
                  </span>
                {/if}
              </div>

              <div class="mt-1 text-sm text-neutral-600">
                <span class="font-medium">Owner:</span> {p.owner}
                {#if p.notes}
                  <span class="mx-2 opacity-50">•</span>
                  <span>{p.notes}</span>
                {/if}
              </div>

              {#if p.options && p.options.length}
                <button
                  class="mt-2 text-sm underline decoration-dotted hover:decoration-solid"
                  on:click={() => toggle(p.id)}
                  aria-expanded={expanded.has(p.id)}
                  aria-controls={`opts-${p.id}`}
                >
                  {expanded.has(p.id) ? 'Hide options' : 'Show options'}
                </button>

                {#if expanded.has(p.id)}
                  <ul id={`opts-${p.id}`} class="mt-2 space-y-1">
                    {#each p.options as opt, i}
                      <li class="rounded-lg border border-neutral-200 px-3 py-2 bg-neutral-50">
                        <div class="text-sm font-medium">{opt.label}</div>
                        {#if opt.detail}
                          <div class="text-sm text-neutral-600">{opt.detail}</div>
                        {/if}
                      </li>
                    {/each}
                  </ul>
                {/if}
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>

    {#if proposals.filter(matches).length === 0}
      <div class="text-sm text-neutral-500 py-6">No proposals match your filters.</div>
    {/if}
  </div>

  <!-- Previous Years Outcomes & Notes -->
  <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
    <div class="flex items-center gap-2 mb-4">
      <span class="material-icons">history_edu</span>
      <h2 class="text-xl font-semibold">Previous Years Outcomes & Notes</h2>
    </div>

    <div class="overflow-x-auto -mx-2 sm:mx-0">
      <table class="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr class="text-left text-sm text-neutral-600">
            <th class="px-2 sm:px-3 py-2">Item</th>
            <th class="px-2 sm:px-3 py-2">Rule Deadline</th>
            <th class="px-2 sm:px-3 py-2">Other Notes</th>
          </tr>
        </thead>
        <tbody>
          {#each previous as o}
            <tr class="align-top">
              <td class="px-2 sm:px-3 py-2 bg-neutral-50 rounded-l-xl">
                <div class="font-medium">{o.title}</div>
              </td>
              <td class="px-2 sm:px-3 py-2 bg-neutral-50 whitespace-nowrap">
                {o.ruleDeadline ?? '—'}
              </td>
              <td class="px-2 sm:px-3 py-2 bg-neutral-50 rounded-r-xl">
                {o.notes ?? '—'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>

<style>
  /* Uses Material Icons if you’ve already loaded them globally. */
  .material-icons { font-size: 1.15rem; line-height: 1; }
</style>
