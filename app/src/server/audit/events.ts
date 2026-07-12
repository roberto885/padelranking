export type AuditEvent = {
  clubId: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
};

export interface AuditWriter { write(event: AuditEvent): Promise<void> }
