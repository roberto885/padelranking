export type Rating = { value: number; deviation: number; volatility: number; matches: number };
export type RatedPlayer = { playerId: string; rating: Rating };
export type Formula = { id: string; tau: number; competitionWeight: number; repeatFactor: number; provisionalMatches: number; floor: number; ceiling: number };
export type RatingChange = { playerId: string; before: Rating; after: Rating; delta: number; expectedWinProbability: number; confidence: "low" | "medium" | "high"; explanation: string };
export type CalculationSnapshot = { formulaId: string; winningTeam: 1 | 2; team1: RatedPlayer[]; team2: RatedPlayer[]; changes: RatingChange[] };

const SCALE = 173.7178;
const g = (phi: number) => 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
const expected = (mu: number, opponentMu: number, opponentPhi: number) => 1 / (1 + Math.exp(-g(opponentPhi) * (mu - opponentMu)));
const confidence = (deviation: number): RatingChange["confidence"] => deviation <= 90 ? "high" : deviation <= 180 ? "medium" : "low";

function team(players: RatedPlayer[]) {
  if (players.length !== 2) throw new Error("DOUBLES_TEAM_REQUIRED");
  const value = (players[0].rating.value + players[1].rating.value) / 2;
  const deviation = Math.sqrt(players[0].rating.deviation ** 2 + players[1].rating.deviation ** 2) / 2;
  return { value, deviation };
}

function update(player: RatedPlayer, opponent: { value: number; deviation: number }, score: 0 | 1, weight: number, formula: Formula, winProbability: number): RatingChange {
  const mu = (player.rating.value - 1500) / SCALE;
  const phi = player.rating.deviation / SCALE;
  const oppMu = (opponent.value - 1500) / SCALE;
  const oppPhi = opponent.deviation / SCALE;
  const e = expected(mu, oppMu, oppPhi);
  const variance = 1 / (g(oppPhi) ** 2 * e * (1 - e));
  const delta = variance * g(oppPhi) * (score - e);
  const a = Math.log(player.rating.volatility ** 2);
  const f = (x: number) => {
    const ex = Math.exp(x);
    return (ex * (delta ** 2 - phi ** 2 - variance - ex)) / (2 * (phi ** 2 + variance + ex) ** 2) - (x - a) / formula.tau ** 2;
  };
  let A = a, B: number;
  if (delta ** 2 > phi ** 2 + variance) B = Math.log(delta ** 2 - phi ** 2 - variance);
  else { let k = 1; while (f(a - k * formula.tau) < 0) k++; B = a - k * formula.tau; }
  let fA = f(A), fB = f(B);
  while (Math.abs(B - A) > 0.000001) { const C = A + ((A - B) * fA) / (fB - fA); const fC = f(C); if (fC * fB <= 0) { A = B; fA = fB; } else fA /= 2; B = C; fB = fC; }
  const volatility = Math.exp(A / 2);
  const phiStar = Math.sqrt(phi ** 2 + volatility ** 2);
  const newPhi = 1 / Math.sqrt(1 / phiStar ** 2 + weight / variance);
  const newMu = mu + newPhi ** 2 * weight * g(oppPhi) * (score - e);
  const rawValue = 1500 + SCALE * newMu;
  const value = Math.min(formula.ceiling, Math.max(formula.floor, rawValue));
  const after = { value, deviation: SCALE * newPhi, volatility, matches: player.rating.matches + 1 };
  const change = value - player.rating.value;
  return { playerId: player.playerId, before: player.rating, after, delta: change, expectedWinProbability: winProbability, confidence: confidence(after.deviation), explanation: `${score ? "Victoria" : "Derrota"} contra un equipo con rating promedio ${Math.round(opponent.value)}. Probabilidad esperada: ${Math.round(winProbability * 100)}%. Cambio: ${change >= 0 ? "+" : ""}${change.toFixed(1)}.` };
}

export function calculateDoubles(input: { team1: RatedPlayer[]; team2: RatedPlayer[]; winningTeam: 1 | 2; formula: Formula }): CalculationSnapshot {
  const t1 = team(input.team1), t2 = team(input.team2);
  const t1Probability = expected((t1.value - 1500) / SCALE, (t2.value - 1500) / SCALE, t2.deviation / SCALE);
  const weight = Math.max(0, input.formula.competitionWeight * input.formula.repeatFactor);
  const changes = [
    ...input.team1.map(p => update(p, t2, input.winningTeam === 1 ? 1 : 0, weight, input.formula, t1Probability)),
    ...input.team2.map(p => update(p, t1, input.winningTeam === 2 ? 1 : 0, weight, input.formula, 1 - t1Probability)),
  ];
  return { formulaId: input.formula.id, winningTeam: input.winningTeam, team1: input.team1, team2: input.team2, changes };
}

export function isProvisional(rating: Rating, formula: Formula) { return rating.matches < formula.provisionalMatches; }
