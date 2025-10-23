<script lang="ts">
  export const prerender = true;

  type Proposal = {
    id: number;
    title: string;
    owner: string;
    notes?: string;
    status: 'NEW' | 'OPEN' | 'CARRIED' | 'REJECTED' | 'TABLED';
    options?: { label: string; detail?: string }[];
  };

  type Outcome = {
    title: string;
    ruleDeadline?: string | number;
    notes?: string;
  };

  const proposals: Proposal[] = [
    { id: 1, title: 'Review bookkeeping (dues, winnings, etc.)', owner: 'Commish', notes: 'Section 7.2, 7.3', status: 'OPEN' },
    { id: 2, title: 'Review player scoring', owner: 'Commish', notes: 'Section 4.1', status: 'OPEN' },
    { id: 3, title: 'Draw for draft order', owner: 'League', status: 'OPEN' },
    {
      id: 4,
      title: 'Draft “ping-pong” entry for #1 spot via FAAB',
      owner: 'Ray Rodriguez',
      status: 'OPEN',
      options: [
        { label: 'Option A', detail: 'Allow 1 team; auction winner gets one entry.' },
        { label: 'Option B', detail: 'Only non-playoff teams eligible.' }
      ]
    },
    {
      id: 5,
      title: 'Buy FAAB right to select division when joining',
      owner: 'Eddie Fuentes / Ray Rodriguez',
      status: 'NEW'
    },
    { id: 6, title: 'Run draft in an auction-type bidding format', owner: 'Commish', status: 'OPEN' },
    { id: 7, title: 'Reduce Pro Bowlers list size / counts', owner: 'Commish', notes: 'Section 13.2', status: 'OPEN' },
    { id: 8, title: 'Punt return yards scoring (vote)', owner: 'John Diaz-Decaro', notes: 'Section 4.1', status: 'OPEN' },
    { id: 9, title: 'Raise dues (75 → 85); 2/3 vote', owner: 'Commish', notes: 'Section 7.3', status: 'OPEN' },
    {
      id: 10,
      title: 'Conditional trades rules (limit picks/FAAB, no trade-back, picks-only must be offered to league, etc.)',
      owner: 'Trey Fuentes',
      notes: 'Section 13',
      status: 'OPEN'
    },
    { id: 11, title: 'Open forum (fairness / rule checks)', owner: 'Commish', status: 'OPEN' }
  ];

  const previous: Outcome[] = [
    { title: 'Top 3 “Pro Bowlers” no trade-back', ruleDeadline: 2025, notes: 'Consider reduce to top 20/25.' },
    { title: '“Best Roster” during playoffs', ruleDeadline: 2025, notes: 'Decision: No' },
    { title: 'Starting / Bench / Taxi / IR settings', ruleDeadline: 2025, notes: '3 | 10 | 3 | 4' },
    { title: 'Taxi squad move rules', ruleDeadline: 2025, notes: 'Rookies can move back; timing adjust.' },
    { title: 'Trade deadline → Week 7', ruleDeadline: 2026 },
    { title: 'Divisions scheduling logic', ruleDeadline: 2026, notes: 'Review reshuffle & tiebreak.' },
    { title: 'Toilet Bowl rules', ruleDeadline: 2026 },
    { title: 'New manager top support for #1 pick', ruleDeadline: 2027 },
    { title: "Loser’s punishment; 2-strike rule", ruleDeadline: 2027 },
    { title: 'Reshuffle divisions every 4 years', ruleDeadline: 2027, notes: 'Next: 2028 off-season.' }
  ];

  const order: Proposal['status'][] = ['NEW', 'OPEN', 'CARRIED', 'REJECTED', 'TABLED'];
  let q = '';
  let owner = 'All';

  const owners = ['All', ...Array.from(new Set(proposals.map(p => p.owner)))];

  const filtered = () =>
    proposals.filter(p => {
      const text = (p.title + ' ' + (p.notes ?? '') + ' ' + p.owner).toLowerCase();
      const qok = !q || text.includes(q.toLowerCase());
      const ook = owner === 'All' || p.owner === owner;
      return qok && ook;
    });

  const groups = () => {
    const by: Record<string, Proposal[]> = {};
    for (const s of order) by[s] = [];
    for (const p of filtered()) by[p.status]?.push(p);
    return by;
  };

  const chipClass = (s: Proposal['status']) => ({
    NEW: 'bg-amber-50 text-amber-700 border-amber-200',
    OPEN: 'bg-neutral-50 text-neutral-700 border-neutral-200',
    CARRIED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    TABLED: 'bg-orange-50 text-orange-700 border-orange-200'
  }[s]);
</script>

<svelte:head>
  <title>Competition Committee</title>
  <meta name="description" content="Competition Committee proposals and previous outcomes." />
</svelte:head>

<section class="max-w-6xl mx-auto px-4 py-8">
  <div class="mb-6">
    <h1 class="text-xl font-semibold tracking-tight">Competition Committee</h1>
    <p class="text-xs text-neutral-600 mt-1">Clean, compact view of proposals and outcomes.</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
    <input
      class="text-sm w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300"
      placeholder="Search proposals…"
      bind:value={q}
    />
    <select
      class="text-sm w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300"
      bind:value={owner}
    >
      {#each owners as o}<option value={o}>{o}</option>{/each}
    </select>
    <div class="hidden sm:block"></div>
  </div>

  <div class="space-y-4">
    {#each order as status}
      {#if groups()[status]?.length}
        <section class="rounded-2xl border border-neutral-200 bg-white">
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200">
            <h2 class="text-sm font-semibold">{status}</h2>
            <span class={'text-[11px] px-2 py-0.5 rounded-full border ' + chipClass(status)}>
              {groups()[status].length} item{groups()[status].length === 1 ? '' : 's'}
            </span>
          </div>

          <div class="p-3 sm:p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {#each groups()[status] as p}
                <article class="rounded-xl border border-neutral-200 bg-neutral-50 p-3 hover:bg-neutral-100 transition">
                  <header class="flex items-start gap-2">
                    <div class="text-[11px] text-neutral-500 w-6 mt-0.5">#{p.id}</div>
                    <div class="flex-1">
                      <h3 class="text-sm font-medium leading-snug">{p.title}</h3>
                      <div class="mt-1 text-[12px] text-neutral-600">
                        <span class="font-medium">Owner:</span> {p.owner}
                        {#if p.notes}
                          <span class="mx-1 opacity-50">•</span>{p.notes}
                        {/if}
                      </div>
                    </div>
                  </header>

                  {#if p.options?.length}
                    <ul class="mt-2 space-y-1">
                      {#each p.options as opt}
                        <li class="text-[12px] rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
                          <span class="font-medium">{opt.label}:</span>
                          {#if opt.detail}<span class="ml-1">{opt.detail}</span>{/if}
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </article>
              {/each}
            </div>
          </div>
        </section>
      {/if}
    {/each}
  </div>

  <section class="mt-8 rounded-2xl border border-neutral-200 bg-white">
    <div class="px-4 py-2.5 border-b border-neutral-200 flex items-center gap-2">
      <h2 class="text-sm font-semibold">Previous Years — Outcomes & Notes</h2>
    </div>

    <div class="p-3 sm:p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each previous as o}
          <article class="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <h3 class="text-sm font-medium leading-snug">{o.title}</h3>
            <div class="mt-1 text-[12px] text-neutral-600 flex flex-wrap gap-x-2 gap-y-0.5">
              <span><span class="font-medium">Rule Deadline:</span> {o.ruleDeadline ?? '—'}</span>
              {#if o.notes}
                <span class="opacity-50">•</span>
                <span>{o.notes}</span>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>
</section>

<style>
  .material-icons { font-size: 1rem; line-height: 1; }
</style>
