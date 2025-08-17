// src/routes/team/[slug]/+page.js
import { error } from "@sveltejs/kit";

const slugify = (s) =>
  s.toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const TEAMS = [
  { name: "Brute Force", dv: "N" },
  { name: "Comeback Kid", dv: "N" },
  { name: "Muad'Dib", dv: "E", badge: "🎗" },
  { name: "SlickBears", dv: "S", badge: "🎗" },
  { name: "People's Champ", dv: "W", badge: "🎗" },
  { name: "Pete Weber Bowl Clu", dv: "E" },
  { name: "Fields love irving", dv: "E" },
  { name: "bLuE BaLLeRs", dv: "S" },
  { name: "88boyz11", dv: "W" },
  { name: "PrimeTime Prodigies", dv: "W" },
  { name: "TexasTimeshifts", dv: "S" },
  { name: "Loud and Stroud", dv: "S" },
  { name: "Bay Area Party", dv: "N" },
  { name: "Vick2times", dv: "E" },
  { name: "CeeDees TDs", dv: "N", badge: "🏆" },
  { name: "Do it to them", dv: "W" },
];

const TEAM_MAP = new Map(TEAMS.map((t) => [slugify(t.name), t]));

/** @type {import('./$types').PageLoad} */
export const load = ({ params }) => {
  const slug = params.slug.toLowerCase();
  const team = TEAM_MAP.get(slug);
  if (!team) throw error(404, "Team not found");
  return { team, slug };
};
