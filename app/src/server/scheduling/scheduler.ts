export type SchedulableMatch = { id: string; participantIds: string[]; durationMinutes: number; earliest: Date; latestFinish: Date; locked?: Assignment; completed?: boolean };
export type Court = { id: string; availableFrom: Date; availableUntil: Date; blackouts: Array<{ from: Date; until: Date }> };
export type Assignment = { matchId: string; courtId: string; startsAt: Date; endsAt: Date; locked: boolean };
export type ScheduleConflict = { matchId: string; code: "NO_SLOT" | "INVALID_MATCH"; explanation: string };

const overlap = (a: { startsAt: Date; endsAt: Date }, b: { startsAt: Date; endsAt: Date }) => a.startsAt < b.endsAt && b.startsAt < a.endsAt;
const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);

export function generateSchedule(input: { matches: SchedulableMatch[]; courts: Court[]; slotMinutes: number; minimumRestMinutes: number }): { assignments: Assignment[]; conflicts: ScheduleConflict[] } {
  if (input.slotMinutes <= 0 || input.minimumRestMinutes < 0) throw new Error("INVALID_SCHEDULER_CONFIGURATION");
  const assignments: Assignment[] = [];
  const conflicts: ScheduleConflict[] = [];
  for (const match of input.matches) {
    if (match.completed && !match.locked) { conflicts.push({ matchId: match.id, code: "INVALID_MATCH", explanation: "Un partido completado debe conservar su asignación." }); continue; }
    if (match.locked) { assignments.push({ ...match.locked, matchId: match.id, locked: true }); continue; }
  }
  const pending = input.matches.filter(m => !m.locked && !m.completed).sort((a, b) => a.earliest.getTime() - b.earliest.getTime() || a.id.localeCompare(b.id));
  for (const match of pending) {
    let selected: Assignment | undefined;
    const courts = [...input.courts].sort((a, b) => a.id.localeCompare(b.id));
    for (let cursor = match.earliest; cursor < match.latestFinish && !selected; cursor = addMinutes(cursor, input.slotMinutes)) {
      const endsAt = addMinutes(cursor, match.durationMinutes);
      if (endsAt > match.latestFinish) break;
      for (const court of courts) {
        const candidate = { matchId: match.id, courtId: court.id, startsAt: cursor, endsAt, locked: false };
        if (cursor < court.availableFrom || endsAt > court.availableUntil) continue;
        if (court.blackouts.some(b => overlap(candidate, { startsAt: b.from, endsAt: b.until }))) continue;
        if (assignments.some(a => a.courtId === court.id && overlap(candidate, a))) continue;
        const playerConflict = assignments.some(a => { const other = input.matches.find(m => m.id === a.matchId); if (!other || !other.participantIds.some(id => match.participantIds.includes(id))) return false; const rested = { startsAt: addMinutes(a.startsAt, -input.minimumRestMinutes), endsAt: addMinutes(a.endsAt, input.minimumRestMinutes) }; return overlap(candidate, rested); });
        if (playerConflict) continue;
        selected = candidate; break;
      }
    }
    if (selected) assignments.push(selected);
    else conflicts.push({ matchId: match.id, code: "NO_SLOT", explanation: "No existe una cancha y hora que respete disponibilidad, bloqueos, duración y descanso de jugadores." });
  }
  return { assignments: assignments.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.courtId.localeCompare(b.courtId)), conflicts };
}
