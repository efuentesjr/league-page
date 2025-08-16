<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium2.jpg" alt="Stadium2" />
  <h2 class="title">Playoffs Projections</h2>

  <div class="overlay">
    <pre>
                  PlayoffComputer Analysis MFFL
Dv	TEAM 				        W-L-T Pts DivSTATUS   PlaySTATUS 	mIn	 Targets  gIn 	DivTgts
4 	Brute Force 		    0-0-0  0   C:24.7% 	C:41.8% T:17.2%  5 	 8.0-8.0  10 	9.0-11.0
4 	Comeback Kid 		    0-0-0  0   C:24.8% 	C:41.7% T:17.4%  5 	 8.0-8.0  10 	9.0-11.0
1 	Muad'Dib 🎗			    0-0-0  0   C:24.8% 	C:41.7% T:17.2%  5 	 8.0-8.0  11 	9.0-11.0
3 	SlickBears 🎗		    0-0-0  0   C:25.2% 	C:42.1% T:17.0%  5 	 8.0-8.0  9  	9.0-11.0
2 	People's Champ🎗	  0-0-0  0   C:25.1% 	C:42.1% T:17.2%  5 	 8.0-8.0  10 	9.0-11.0
1 	Pete Weber Bowl Clu 0-0-0  0   C:25.0% 	C:41.8% T:17.1%  5 	 8.0-8.0  11 	9.0-11.0
1 	Fields love irving 	0-0-0  0   C:25.0% 	C:42.0% T:17.2%  5 	 8.0-8.0  10 	9.0-11.0
3 	bLuE BaLLeRs 		    0-0-0  0   C:24.9% 	C:41.9% T:17.3%  5 	 8.0-8.0  11 	9.0-11.0
2 	88boyz11 			      0-0-0  0   C:25.1% 	C:42.1% T:17.1%  5 	 8.0-8.0  11 	9.0-11.0
2 	PrimeTime Prodigies	0-0-0  0   C:25.0% 	C:42.0% T:17.0%  5 	 8.0-8.0  11 	9.0-11.0
3 	TexasTimeshifts 	  0-0-0  0   C:24.9% 	C:42.0% T:17.2%  5 	 8.0-8.0  11 	9.0-11.0
3 	Loud and Stroud 	  0-0-0  0   C:24.8% 	C:41.7% T:17.1%  5 	 8.0-8.0  10 	9.0-11.0
4 	Bay Area Party  	  0-0-0  0   C:25.3% 	C:42.1% T:17.2%  5 	 8.0-8.0  11 	9.0-11.0
1 	Vick2times 			    0-0-0  0   C:25.0% 	C:42.2% T:17.1%  5 	 8.0-8.0  10 	9.0-11.0
4 	CeeDees TDs 🏆		  0-0-0  0   C:25.0% 	C:41.9% T:17.2%  5 	 8.0-8.0  11 	9.0-11.0
2 	Do it to them 		  0-0-0  0   C:24.6% 	C:41.7% T:17.4%  5 	 8.0-8.0  11 	9.0-11.0

LEGEND:
Status C=Clinch % 
T=% that will end up in a tiebreak not resolved yet
mIn=Wins needed for any chance
Target=Projected Wins needed 
gIn=Wins that should guarantee a spot (if any then Controls Own Destiny)
Due to many remaining games the analysis incorporated some randomization methods. The accuracy of status,
odds, targets, and 'paths' will depend on the depth of analysis as well as the number of remaining games.
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
  top: 12px;                /* push it slightly higher */
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.25rem 0.5rem;
  color: black;
  font-weight: 900;         /* extra bold */
  background: none;
  font-size: clamp(2rem, 4vw, 3rem); /* larger scaling */
  white-space: nowrap;      /* keep it inline (no wrapping) */
  text-align: center;
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
