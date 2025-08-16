<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium2.jpg" alt="Stadium2" />
  <h2 class="title">Playoffs Projections</h2>

  <div class="overlay">
    <pre>
ID  Dv  Team                  W-L-T  DvWLT  Pts  Division Status  Playoff Status
1   N   CeeDees TDs🏆         0-0-0  0-0-0   0   Undetermined     Undetermined
2   N   The Comeback Kid      0-0-0  0-0-0   0   Undetermined     Undetermined
3   N   Brute Force Attack    0-0-0  0-0-0   0   Undetermined     Undetermined
4   N   Bay Area Party Supp   0-0-0  0-0-0   0   Undetermined     Undetermined
5   W   The People's Champ 🎗 0-0-0  0-0-0   0   Undetermined     Undetermined
6   W   PrimeTime Prodigies   0-0-0  0-0-0   0   Undetermined     Undetermined
7   W   Do it to them         0-0-0  0-0-0   0   Undetermined     Undetermined
8   W   88boyz11              0-0-0  0-0-0   0   Undetermined     Undetermined
9   S   SlickBears 🎗         0-0-0  0-0-0   0   Undetermined     Undetermined
10  S   bLuE BaLLeRs          0-0-0  0-0-0   0   Undetermined     Undetermined
11  S   TexasTimeshifts       0-0-0  0-0-0   0   Undetermined     Undetermined
12  S   Loud and Stroud       0-0-0  0-0-0   0   Undetermined     Undetermined
13  E   Muad'Dib 🎗           0-0-0  0-0-0   0   Undetermined     Undetermined
14  E   Vick2times            0-0-0  0-0-0   0   Undetermined     Undetermined
15  E   Pete Weber Bowling C  0-0-0  0-0-0   0   Undetermined     Undetermined
16  E   Fields love irvings   0-0-0  0-0-0   0   Undetermined     Undetermined
    </pre>
  </div>
</div>

<style>
.image-wrapper {
  position: relative;
  display: block;
  max-width: 900px;
  margin: 0.5rem auto;
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: auto;
}

/* Title: keep inline, bigger font */
.image-wrapper .title {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.25rem 0.5rem;
  color: black;
  font-weight: bold;
  background: none;
  font-size: clamp(1.4rem, 3vw, 2rem);
  white-space: nowrap;   /* Prevents wrapping */
}

/* Overlay panel: move up from bottom */
.overlay {
  position: absolute;
  left: 50%;
  top: 30%;   /* <-- was bottom before, now push it higher */
  transform: translateX(-50%);
  width: min(95%, 860px);
  max-height: 55%;
  overflow: auto;
  padding: 0.5rem 0.75rem;
  background: rgba(0,0,0,0.45);
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.25);
  -webkit-overflow-scrolling: touch;
}

/* Table formatting */
.overlay pre {
  margin: 0;
  color: #fff;
  font: 500 0.9rem/1.2rem ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  white-space: pre;
  overflow-x: auto;
}

@media (max-width: 480px) {
  .overlay { 
    top: 25%;       /* On small screens, start table even higher */
    width: 96%;
  }
  .overlay pre { 
    font-size: 0.8rem; 
    line-height: 1.1rem; 
  }
}
</style>

