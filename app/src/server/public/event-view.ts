export type PublicEventView = {
  name: string; club: string; dateLabel: string; location: string; status: "upcoming" | "live" | "completed";
  category: string; categories: string[];
  courts: Array<{ court: string; state: "live" | "next" | "available"; team1?: string; team2?: string; score?: string; time?: string }>;
  schedule: Array<{ time: string; court: string; round: string; team1: string; team2: string; status: "scheduled" | "live" | "completed"; score?: string }>;
  standings: Array<{ rank: number; team: string; played: number; won: number; points: number; difference: number }>;
};

export const demoPublicEvent: PublicEventView = {
  name: "Americano Nocturno", club: "Punto Club", dateLabel: "Sábado 11 de julio · 18:00–22:30", location: "Club principal", status: "live", category: "Intermedio", categories: ["Intermedio", "Avanzado"],
  courts: [
    { court: "Cancha 1", state: "live", team1: "Ana / Carlos", team2: "Lucía / Mateo", score: "18–14" },
    { court: "Cancha 2", state: "live", team1: "Bruno / Diego", team2: "Sofía / Andrés", score: "11–9" },
    { court: "Cancha 3", state: "next", team1: "Elena / Pablo", team2: "María / Jorge", time: "19:15" },
  ],
  schedule: [
    { time: "18:30", court: "Cancha 1", round: "Ronda 2", team1: "Ana / Carlos", team2: "Lucía / Mateo", status: "live", score: "18–14" },
    { time: "18:30", court: "Cancha 2", round: "Ronda 2", team1: "Bruno / Diego", team2: "Sofía / Andrés", status: "live", score: "11–9" },
    { time: "19:15", court: "Cancha 3", round: "Ronda 3", team1: "Elena / Pablo", team2: "María / Jorge", status: "scheduled" },
    { time: "20:00", court: "Cancha 1", round: "Ronda 3", team1: "Ana / Mateo", team2: "Bruno / Sofía", status: "scheduled" },
  ],
  standings: [
    { rank: 1, team: "Ana López", played: 2, won: 2, points: 42, difference: 12 },
    { rank: 2, team: "Bruno Martínez", played: 2, won: 2, points: 38, difference: 8 },
    { rank: 3, team: "Lucía Torres", played: 2, won: 1, points: 34, difference: 3 },
    { rank: 4, team: "Carlos Vega", played: 2, won: 1, points: 31, difference: 1 },
  ],
};
