export type AmericanoPlayer = { id: string; seed: number };
export type AmericanoMatch = { court: number; team1: [string, string]; team2: [string, string] };
export type AmericanoRound = { number: number; matches: AmericanoMatch[]; resting: string[] };

const pairKey = (a: string, b: string) => [a, b].sort().join(":");

export function generateAmericano(input: { players: AmericanoPlayer[]; courts: number; rounds: number }): AmericanoRound[] {
  if (input.players.length < 4) throw new Error("AT_LEAST_FOUR_PLAYERS_REQUIRED");
  if (input.courts < 1 || input.rounds < 1) throw new Error("INVALID_AMERICANO_CONFIGURATION");
  const ids = new Set(input.players.map(p => p.id));
  if (ids.size !== input.players.length) throw new Error("DUPLICATE_PLAYER");
  const players = [...input.players].sort((a, b) => a.seed - b.seed || a.id.localeCompare(b.id)).map(p => p.id);
  const activeCount = Math.min(Math.floor(players.length / 4), input.courts) * 4;
  const partnerCounts = new Map<string, number>(), opponentCounts = new Map<string, number>(), restCounts = new Map(players.map(p => [p, 0]));
  const count = (map: Map<string, number>, a: string, b: string) => map.get(pairKey(a, b)) ?? 0;
  const bump = (map: Map<string, number>, a: string, b: string) => map.set(pairKey(a, b), count(map, a, b) + 1);
  const rounds: AmericanoRound[] = [];
  for (let round = 1; round <= input.rounds; round++) {
    const ordered = [...players].sort((a, b) => (restCounts.get(a)! - restCounts.get(b)!) || a.localeCompare(b));
    const active = ordered.slice(0, activeCount), resting = ordered.slice(activeCount);
    resting.forEach(p => restCounts.set(p, restCounts.get(p)! + 1));
    const matches: AmericanoMatch[] = [];
    while (active.length >= 4) {
      const a = active.shift()!;
      let best: { group: [string,string,string]; score: number; key: string } | undefined;
      for (let i=0;i<active.length;i++) for (let j=i+1;j<active.length;j++) for (let k=j+1;k<active.length;k++) {
        const trio: [string,string,string] = [active[i],active[j],active[k]];
        const arrangements = [[trio[0],trio[1],trio[2]],[trio[1],trio[0],trio[2]],[trio[2],trio[0],trio[1]]] as const;
        for (const [partner,o1,o2] of arrangements) {
          const score = count(partnerCounts,a,partner)*100 + count(partnerCounts,o1,o2)*100 + count(opponentCounts,a,o1)+count(opponentCounts,a,o2)+count(opponentCounts,partner,o1)+count(opponentCounts,partner,o2);
          const key = [partner,o1,o2].join(":"); if (!best || score<best.score || (score===best.score && key<best.key)) best={group:[partner,o1,o2],score,key};
        }
      }
      const [partner,o1,o2] = best!.group;
      for (const p of [partner,o1,o2]) active.splice(active.indexOf(p),1);
      bump(partnerCounts,a,partner); bump(partnerCounts,o1,o2);
      for (const x of [a,partner]) for (const y of [o1,o2]) bump(opponentCounts,x,y);
      matches.push({ court: matches.length+1, team1:[a,partner], team2:[o1,o2] });
    }
    rounds.push({ number: round, matches, resting });
  }
  return rounds;
}
