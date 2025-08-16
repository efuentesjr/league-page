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
14  E   Vick2times              0-0-0  0-0-0      0   Undetermined     Undetermined
15  E   Pete Weber Bowling Club 0-0-0  0-0-0      0   Undetermined     Undetermined
16  E   Fields love irvings pit 0-0-0  0-0-0      0   Undetermined     Undetermined
    </pre>
  </div>
</div>

<style>
/* Desktop/tablet defaults */
.image-wrapper {
  position: relative;
  display: block;
  max-width: 900px;
  margin: 0.5rem auto;
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: auto;        /* keep natural aspect ratio on larger screens */
  object-fit: cover;
}

.image-wrapper .title {
  position: absolute;
  top: 4px;            /* closer to the top edge */
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.25rem 0.5rem;
  color: black;
  font-weight: bold;
  background: none;
  font-size: clamp(1rem, 2.2vw, 1.4rem);
}

/* Overlay sits on top of the image on wider screens */
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
  -webkit-overflow-scrolling: touch;
}

.overlay pre {
  margin: 0;
  color: #fff;
  font: 500 0.9rem/1.2rem ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  white-space: pre;    /* keep columns aligned on desktop */
  overflow-x: auto;
}

/* MOBILE: move table BELOW the image and shrink things a bit */
@media (max-width: 600px) {
  .image-wrapper { max-width: 100%; }

  .image-wrapper img {
    max-height: 200px;      /* make the banner shorter on phones */
    min-height: 160px;
    object-fit: cover;
  }

  .image-wrapper .title {
    top: 2px;
    font-size: 1rem;
  }

  .overlay {
    position: static;       /* no longer over the image */
    transform: none;
    width: 100%;
    max-height: none;       /* let it size naturally */
    margin-top: 0.5rem;     /* spacing under the image */
    border-radius: 8px;
  }

  .overlay pre {
    white-space: pre-wrap;  /* wrap long rows on small screens */
    font-size: 0.85rem;
    line-height: 1.15rem;
  }
}
</style>

