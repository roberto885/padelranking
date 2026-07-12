export type EntryId = string;
export type StandingMatch = { id: string; a: EntryId; b: EntryId; winner: EntryId | null; setsA: number; setsB: number; gamesA: number; gamesB: number; pointsA?: number; pointsB?: number; excluded?: boolean };
export type Criterion = "match_points" | "match_wins" | "head_to_head" | "set_difference" | "sets_won" | "game_difference" | "games_won" | "point_difference" | "points_won" | "fewest_walkovers" | "stable_draw";
export type EntrySeed = { id: EntryId; name: string; walkovers: number; drawSeed: number };
export type RankedEntry = EntrySeed & { played: number; matchPoints: number; wins: number; setDifference: number; setsWon: number; gameDifference: number; gamesWon: number; pointDifference: number; pointsWon: number; rank: number; explanation: string[] };

function metrics(entry: EntrySeed, matches: StandingMatch[]): Omit<RankedEntry, keyof EntrySeed | "rank" | "explanation"> {
  const relevant = matches.filter(m => !m.excluded && (m.a === entry.id || m.b === entry.id));
  let wins = 0, setsWon = 0, setsLost = 0, gamesWon = 0, gamesLost = 0, pointsWon = 0, pointsLost = 0;
  for (const m of relevant) { const home = m.a === entry.id; if (m.winner === entry.id) wins++; setsWon += home ? m.setsA : m.setsB; setsLost += home ? m.setsB : m.setsA; gamesWon += home ? m.gamesA : m.gamesB; gamesLost += home ? m.gamesB : m.gamesA; pointsWon += home ? (m.pointsA ?? 0) : (m.pointsB ?? 0); pointsLost += home ? (m.pointsB ?? 0) : (m.pointsA ?? 0); }
  return { played: relevant.length, matchPoints: wins * 2 + (relevant.length - wins), wins, setDifference: setsWon - setsLost, setsWon, gameDifference: gamesWon - gamesLost, gamesWon, pointDifference: pointsWon - pointsLost, pointsWon };
}

const labels: Record<Criterion, string> = { match_points: "puntos de partido", match_wins: "partidos ganados", head_to_head: "enfrentamiento directo", set_difference: "diferencia de sets", sets_won: "sets ganados", game_difference: "diferencia de juegos", games_won: "juegos ganados", point_difference: "diferencia de puntos", points_won: "puntos ganados", fewest_walkovers: "menos walkovers", stable_draw: "sorteo final" };

function value(entry: RankedEntry, criterion: Exclude<Criterion, "head_to_head">): number {
  if (criterion === "fewest_walkovers") return -entry.walkovers;
  if (criterion === "stable_draw") return -entry.drawSeed;
  const map = { match_points: entry.matchPoints, match_wins: entry.wins, set_difference: entry.setDifference, sets_won: entry.setsWon, game_difference: entry.gameDifference, games_won: entry.gamesWon, point_difference: entry.pointDifference, points_won: entry.pointsWon };
  return map[criterion];
}

export function rankStandings(entries: EntrySeed[], matches: StandingMatch[], criteria: Criterion[]): RankedEntry[] {
  if (!criteria.length || criteria[criteria.length - 1] !== "stable_draw") throw new Error("DETERMINISTIC_FINAL_CRITERION_REQUIRED");
  const base = entries.map(e => ({ ...e, ...metrics(e, matches), rank: 0, explanation: [] as string[] }));
  const resolve = (group: RankedEntry[], criterionIndex: number): RankedEntry[] => {
    if (group.length <= 1) return group;
    const criterion = criteria[criterionIndex];
    if (!criterion) return group;
    let scored: Array<{ entry: RankedEntry; score: number }>;
    if (criterion === "head_to_head") {
      const ids = new Set(group.map(e => e.id));
      const mini = matches.filter(m => ids.has(m.a) && ids.has(m.b));
      scored = group.map(e => { const x = metrics(e, mini); return { entry: e, score: x.wins * 1_000_000 + x.setDifference * 1_000 + x.gameDifference }; });
    } else scored = group.map(entry => ({ entry, score: value(entry, criterion) }));
    scored.sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
    const partitions: Array<typeof scored> = [];
    for (const item of scored) { const last = partitions.at(-1); if (!last || last[0].score !== item.score) partitions.push([item]); else last.push(item); }
    return partitions.flatMap(part => {
      const annotated = part.map(x => ({ ...x.entry, explanation: [...x.entry.explanation, part.length === group.length ? `Empate persistente por ${labels[criterion]}.` : `Posición resuelta por ${labels[criterion]} (${x.score}).`] }));
      return part.length > 1 ? resolve(annotated, criterionIndex + 1) : annotated;
    });
  };
  return resolve(base, 0).map((entry, index) => ({ ...entry, rank: index + 1 }));
}
