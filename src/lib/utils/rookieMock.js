/*
 * ============================================================
 * COMMISSIONER'S ROOKIE MOCK
 * ============================================================
 * Fills the upcoming rookie draft board before the NFL draft, when
 * college prospects aren't in Sleeper yet. Player N goes on overall
 * pick N; picks past the end of the list show "TBD".
 *
 * To update: replace `season`, `source`, `updated` and `players`
 * (in board order, QB/RB/WR/TE only, current school).
 *
 * Once the NFL draft is done and DynastyProcess lists that rookie class
 * with NFL teams, the board switches to the automatic projection on its own
 * and this list is ignored.
 */

export const ROOKIE_MOCK = {
	season: 2027,
	source: "Commissioner's mock (via r/DynastyFF big board)",
	updated: '2026-10-20',
	players: [
		{name: "Jeremiah Smith", pos: "WR", school: "Ohio State"},
		{name: "Jadan Baugh", pos: "RB", school: "Florida"},
		{name: "Nick Marsh", pos: "WR", school: "Indiana"},
		{name: "Charlie Becker", pos: "WR", school: "Indiana"},
		{name: "Nate Frazier", pos: "RB", school: "Georgia"},
		{name: "Kewan Lacy", pos: "RB", school: "Ole Miss"},
		{name: "Cam Coleman", pos: "WR", school: "Texas"},
		{name: "Drew Mestemaker", pos: "QB", school: "Oklahoma State"},
		{name: "K.J. Duff", pos: "WR", school: "Rutgers"},
		{name: "Ryan Coleman-Williams", pos: "WR", school: "Alabama"},
		{name: "Jamari Johnson", pos: "TE", school: "Oregon"},
		{name: "Hollywood Smothers", pos: "RB", school: "Texas"},
		{name: "Trinidad Chambliss", pos: "QB", school: "Ole Miss"},
		{name: "C.J. Carr", pos: "QB", school: "Notre Dame"},
		{name: "Trey'Dez Green", pos: "TE", school: "LSU"},
		{name: "Arch Manning", pos: "QB", school: "Texas"},
		{name: "Dante Moore", pos: "QB", school: "Oregon"},
		{name: "Wayshawn Parker", pos: "RB", school: "Utah"},
		{name: "Justice Haynes", pos: "RB", school: "Georgia Tech"},
		{name: "Luke Reynolds", pos: "TE", school: "Virginia Tech"},
		{name: "Bryant Wesco Jr.", pos: "WR", school: "Clemson"},
		{name: "Deuce Alexander", pos: "WR", school: "Ole Miss"},
		{name: "Jayden Maiava", pos: "QB", school: "USC"},
		{name: "Ryan Wingo", pos: "WR", school: "Texas"},
		{name: "Amare Thomas", pos: "WR", school: "Houston"},
		{name: "T.J. Moore", pos: "WR", school: "Clemson"},
		{name: "Austin Simmons", pos: "QB", school: "Missouri"},
		{name: "Darian Mensah", pos: "QB", school: "Miami (FL)"},
		{name: "Antwan Raymond", pos: "RB", school: "Rutgers"},
		{name: "L.J. Martin", pos: "RB", school: "BYU"},
		{name: "Reed Harris", pos: "WR", school: "Arizona State"},
		{name: "Fluff Bothwell", pos: "RB", school: "Mississippi State"},
		{name: "Junior Sherrill", pos: "WR", school: "Vanderbilt"},
		{name: "Turbo Richard", pos: "RB", school: "Indiana"},
		{name: "Cayden Lee", pos: "WR", school: "Missouri"},
		{name: "Omarion Miller", pos: "WR", school: "Arizona State"},
		{name: "Mario Craver", pos: "WR", school: "Texas A&M"},
		{name: "C.J. Baxter", pos: "RB", school: "Kentucky"},
		{name: "Mark Fletcher Jr.", pos: "RB", school: "Miami (FL)"},
		{name: "Julian Sayin", pos: "QB", school: "Ohio State"},
		{name: "Anthony Evans III", pos: "WR", school: "Mississippi State"},
		{name: "Wyatt Young", pos: "WR", school: "Oklahoma State"},
		{name: "Carlos Hernandez", pos: "WR", school: "Wake Forest"},
		{name: "Drake Lindsey", pos: "QB", school: "Minnesota"},
		{name: "Sam Leavitt", pos: "QB", school: "LSU"},
		{name: "Chris Marshall", pos: "WR", school: "Arkansas"},
		{name: "Joseph Williams", pos: "WR", school: "Colorado"},
		{name: "Collin Dixon", pos: "WR", school: "Illinois"},
		{name: "Isaac Brown", pos: "RB", school: "Louisville"},
		{name: "Jordan Faison", pos: "WR", school: "Notre Dame"}
	]
};
