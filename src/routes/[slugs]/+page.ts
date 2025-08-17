// src/routes/team/[slug]/+page.ts
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

// tiny helper to build slugs like your links
const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/['’]/g, "")       // remove apostrophes
    .replace(/\s+/g, "-")       // spaces -> dashes
    .replace(/[^a-z0-9-]/g, ""); // strip other chars

// Minimal data you can expand later
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

const TEAM_MAP = new Map(TEAMS.map(t => [slugify(t.name), t]));

export const load: PageLoad = ({ params }) => {
  const slug = params.slug.toLowerCase();
  const team = TEAM_MAP.get(slug);
  if (!team) throw error(404, "Team not found");

  // You can fetch or compute more here later (records, odds, etc.)
  return {
    team,
    slug,
  };
};
