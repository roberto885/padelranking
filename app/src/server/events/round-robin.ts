export type RoundRobinEntry = { id: string; seed: number };
export type RoundRobinMatch = { id: string; round: number; leg: 1 | 2; home: string; away: string };
export type RoundRobinRound = { number: number; matches: RoundRobinMatch[]; bye?: string };

function stable(entries: RoundRobinEntry[]) {
  const ids = new Set<string>();
  for (const entry of entries) { if (ids.has(entry.id)) throw new Error("DUPLICATE_ENTRY"); ids.add(entry.id); }
  return [...entries].sort((a, b) => a.seed - b.seed || a.id.localeCompare(b.id));
}

function oneLeg(entries: RoundRobinEntry[]): RoundRobinRound[] {
  if (entries.length < 2) throw new Error("AT_LEAST_TWO_ENTRIES_REQUIRED");
  const ordered = stable(entries).map(e => e.id);
  const hasBye = ordered.length % 2 === 1;
  const rotation: Array<string | null> = hasBye ? [...ordered, null] : ordered;
  const rounds: RoundRobinRound[] = [];
  for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex++) {
    const matches: RoundRobinMatch[] = []; let bye: string | undefined;
    for (let i = 0; i < rotation.length / 2; i++) {
      const a = rotation[i], b = rotation[rotation.length - 1 - i];
      if (!a || !b) { bye = a ?? b ?? undefined; continue; }
      const swap = (roundIndex + i) % 2 === 1;
      const home = swap ? b : a, away = swap ? a : b;
      matches.push({ id: `rr-r${roundIndex + 1}-${home}-${away}`, round: roundIndex + 1, leg: 1, home, away });
    }
    rounds.push({ number: roundIndex + 1, matches, bye });
    const last = rotation.pop()!;
    rotation.splice(1, 0, last);
  }
  return rounds;
}

export function generateRoundRobin(entries: RoundRobinEntry[], doubleRoundRobin = false): RoundRobinRound[] {
  const first = oneLeg(entries);
  if (!doubleRoundRobin) return first;
  const offset = first.length;
  const second = first.map(round => ({ number: round.number + offset, bye: round.bye, matches: round.matches.map(match => ({ ...match, id: `rr-r${match.round + offset}-${match.away}-${match.home}`, round: match.round + offset, leg: 2 as const, home: match.away, away: match.home })) }));
  return [...first, ...second];
}
