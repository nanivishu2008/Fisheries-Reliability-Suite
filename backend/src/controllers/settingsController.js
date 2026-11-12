import { AuditLog } from '../models/AuditLog.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { SparePart } from '../models/SparePart.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action = '', actorRole = '', outcome = '', entityName = '', page = 1, limit = 25 } = req.query;

    const query = {};
    if (action) query.action = { $regex: action, $options: 'i' };
    if (actorRole) query.actorRole = actorRole;
    if (outcome) query.outcome = outcome;
    if (entityName) query.entityName = entityName;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      'Audit logs retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const exportAuditLogsCsv = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(500);

    const headers = 'Timestamp,Actor,Role,Action,Entity,EntityId,Outcome,Details,IP\n';
    const rows = logs.map(
      (l) =>
        `"${new Date(l.timestamp).toISOString()}","${l.actorName}","${l.actorRole}","${l.action}","${l.entityName}","${l.entityId}","${l.outcome}","${(l.details || '').replace(/"/g, '""')}","${l.ipAddress}"`
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
    return res.status(200).send(headers + rows.join('\n'));
  } catch (err) {
    next(err);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.find();
    return sendSuccess(res, { settings }, 'System settings retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateSetting = async (req, res, next) => {
  try {
    const { key, value, description, category } = req.body;
    if (!key) return sendError(res, 'Setting key is required', 400);

    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      {
        key,
        value,
        description,
        category: category || 'ASSETS',
        lastUpdatedBy: req.user.name,
      },
      { upsert: true, new: true }
    );

    await logAuditEvent({
      req,
      action: 'UPDATE_SYSTEM_SETTING',
      entityName: 'SystemSetting',
      entityId: setting._id,
      newState: { key, value },
      details: `Updated system configuration parameter '${key}'`,
    });

    return sendSuccess(res, { setting }, 'Setting saved successfully');
  } catch (err) {
    next(err);
  }
};

export const getSpareParts = async (req, res, next) => {
  try {
    const parts = await SparePart.find().sort({ name: 1 });
    return sendSuccess(res, { parts }, 'Spare parts catalog retrieved');
  } catch (err) {
    next(err);
  }
};

export const createSparePart = async (req, res, next) => {
  try {
    const part = await SparePart.create(req.body);
    return sendSuccess(res, { part }, 'Spare part added to inventory', 201);
  } catch (err) {
    next(err);
  }
};
