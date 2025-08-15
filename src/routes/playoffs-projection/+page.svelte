<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium.jpg" alt="Stadium" />
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
.image-wrapper {
  position: relative;
  display: block;
  max-width: 900px;
  margin: 0.5rem auto; /* small top space so it’s not jammed under the nav */
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: auto;
}

/* Title centered at the top of the image */
.image-wrapper .title {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.25rem 0.5rem;
  color: black;
  font-weight: bold;
  background: none;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

/* Overlay panel */
.overlay {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  width: min(95%, 860px);
  max-height: 45%;
  overflow: auto;
  padding: 0.5rem 0.75rem;
  background: rgba(0,0,0,0.45);
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.25);
  -webkit-overflow-scrolling: touch; /* smooth scroll on iOS */
}

/* Preformatted text: no wrapping; allow horizontal scroll to keep columns aligned */
.overlay pre {
  margin: 0;
  color: #fff;
  font: 500 0.9rem/1.2rem ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  white-space: pre;          /* keep columns intact */
  overflow-x: auto;          /* let user scroll sideways on mobile */
}

@media (max-width: 480px) {
  .overlay { 
    max-height: 55%;
    bottom: 6px;
    width: 96%;
  }
  .overlay pre { 
    font-size: 0.8rem; 
    line-height: 1.1rem; 
  }
}
</style>
