import { AuditLog } from '../models/AuditLog.js';

export const logAuditEvent = async ({
  req,
  action,
  entityName,
  entityId = '',
  previousState = null,
  newState = null,
  outcome = 'SUCCESS',
  details = '',
}) => {
  try {
    const actorId = req?.user?._id || null;
    const actorName = req?.user?.name || 'System / Unauthenticated';
    const actorRole = req?.user?.role || 'System';
    const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

    await AuditLog.create({
      actorId,
      actorName,
      actorRole,
      action,
      entityName,
      entityId: String(entityId),
      previousState,
      newState,
      ipAddress,
      outcome,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Audit log creation error:', err.message);
  }
};
