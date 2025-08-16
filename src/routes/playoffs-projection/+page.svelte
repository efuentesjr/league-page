<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium1.jpg" alt="Stadium1" />
  <h1 class="title">Playoffs Projections</h1>

  <div class="overlay">
    <pre>
ID  Dv  Team                    W-L-T  DvWLT  Points  Division Status  Playoff Status
1   N   Brute Force Attack      0-0-0  0-0-0      0   Undetermined     Undetermined
2   N   The Comeback Kid        0-0-0  0-0-0      0   Undetermined     Undetermined
3   N   CeeDees TDs             0-0-0  0-0-0      0   Undetermined     Undetermined
4   N   Bay Area Party Supplies 0-0-0  0-0-0      0   Undetermined     Undetermined
5   W   The People's Champ      0-0-0  0-0-0      0   Undetermined     Undetermined
6   W   PrimeTime Prodigies     0-0-0  0-0-0      0   Undetermined     Undetermined
7   W   Do it to them           0-0-0  0-0-0      0   Undetermined     Undetermined
8   W   88boyz11                0-0-0  0-0-0      0   Undetermined     Undetermined
9   S   SlickBears              0-0-0  0-0-0      0   Undetermined     Undetermined
10  S   bLuE BaLLeRs            0-0-0  0-0-0      0   Undetermined     Undetermined
11  S   TexasTimeshifts         0-0-0  0-0-0      0   Undetermined     Undetermined
12  S   Loud and Stroud         0-0-0  0-0-0      0   Undetermined     Undetermined
13  E   Muad'Dib                0-0-0  0-0-0      0   Undetermined     Undetermined
14  1   Vick2times              0-0-0  0-0-0      0   Undetermined     Undetermined
15  4   Pete Weber Bowling Club 0-0-0  0-0-0      0   Undetermined     Undetermined
16  2   Fields love irvings pit 0-0-0  0-0-0      0   Undetermined     Undetermined
    </pre>
  </div>
</div>

<style>
/* Keep content centered; use a slimmer hero banner */
.image-wrapper {
  position: relative;
  display: block;
  max-width: 900px;
  margin: 0.5rem auto;
}

/* Slimmer/taller control: cap height so it doesn't eat the page */
.image-wrapper img {
  display: block;
  width: 100%;
  max-height: 300px;         /* reduce vertical space */
  min-height: 180px;         /* avoid being too short on small phones */
  object-fit: cover;         /* crop edges instead of stretching */
}

/* Title pinned to the very top, slightly smaller */
.image-wrapper .title {
  position: absolute;
  top: 0;                    /* push further up */
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.25rem 0.5rem;
  color: black;
  font-weight: bold;
  background: none;
  font-size: clamp(0.95rem, 2.2vw, 1.25rem);
}

/* Overlay panel trimmed down */
.overlay {
  position: absolute;
  left: 50%;
  bottom: 8px;               /* a bit tighter to bottom edge */
  transform: translateX(-50%);
  width: min(95%, 860px);
  max-height: 35%;           /* less dominant on mobile */
  overflow: auto;
  padding: 0.4rem 0.6rem;    /* tighter padding */
  background: rgba(0,0,0,0.45);
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.25);
  -webkit-overflow-scrolling: touch;
}

/* Keep columns aligned; allow horizontal scroll on phones */
.overlay pre {
  margin: 0;
  color: #fff;
  font: 500 0.85rem/1.1rem ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  white-space: pre;          /* no wrapping */
  overflow-x: auto;          /* side-scroll when needed */
}

@media (max-width: 480px) {
  .image-wrapper img { max-height: 260px; }
  .overlay { max-height: 42%; width: 96%; }
  .overlay pre { font-size: 0.8rem; line-height: 1.05rem; }
}
</style>
