import { Telemetry } from '../models/Telemetry.js';
import { Asset } from '../models/Asset.js';
import { Breakdown } from '../models/Breakdown.js';
import { Inspection } from '../models/Inspection.js';
import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const recordTelemetry = async (req, res, next) => {
  try {
    const { assetId, parameter, readingValue, unit, operatingContext, source = 'MANUAL_ENTRY' } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return sendError(res, 'Asset not found', 404);

    // Dynamic threshold detection
    let isAnomaly = false;
    let anomalyReason = '';

    const paramLower = parameter.toLowerCase();
    const val = Number(readingValue);

    if (paramLower.includes('temp') && val > 75) {
      isAnomaly = true;
      anomalyReason = `Operating temperature ${val}${unit} exceeds safe operating limit of 75°C`;
    } else if (paramLower.includes('vibration') && val > 4.5) {
      isAnomaly = true;
      anomalyReason = `Rotational vibration ${val}${unit} exceeds dynamic vibration limit of 4.5 mm/s`;
    } else if (paramLower.includes('oxygen') && val < 4.0) {
      isAnomaly = true;
      anomalyReason = `Dissolved oxygen ${val}${unit} dropped below minimum aquatic survival threshold of 4.0 mg/L`;
    }

    const telemetry = await Telemetry.create({
      assetId,
      parameter,
      readingValue: val,
      unit,
      operatingContext: operatingContext || 'Operational Cycle',
      isAnomaly,
      anomalyReason,
      source,
      recordedBy: req.user?._id || null,
      timestamp: new Date(),
    });

    // Update asset condition and health score dynamically
    if (isAnomaly) {
      asset.currentCondition = val > 85 || val > 6.0 || (paramLower.includes('oxygen') && val < 3.0) ? 'Critical' : 'Warning';
      asset.healthScore = Math.max(15, asset.healthScore - 15);
      await asset.save();

      // Dispatch alert notification
      await Notification.create({
        title: `Telemetry Anomaly: ${asset.name}`,
        message: `${parameter} registered abnormal value of ${val} ${unit}. ${anomalyReason}`,
        type: 'ALERT',
        severity: asset.currentCondition === 'Critical' ? 'urgent' : 'warning',
        relatedEntityId: asset._id.toString(),
        relatedEntityType: 'Asset',
      });
    }

    await logAuditEvent({
      req,
      action: 'RECORD_TELEMETRY',
      entityName: 'Telemetry',
      entityId: telemetry._id,
      details: `Logged ${parameter}: ${val} ${unit} for ${asset.assetCode} (${isAnomaly ? 'ANOMALY' : 'NORMAL'})`,
    });

    return sendSuccess(res, { telemetry, assetCurrentCondition: asset.currentCondition }, 'Telemetry reading recorded', 201);
  } catch (err) {
    next(err);
  }
};

export const getTelemetryTrends = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const { parameter, limit = 50 } = req.query;

    const query = { assetId };
    if (parameter) query.parameter = parameter;

    const readings = await Telemetry.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    // Reverse to chronological order for line charts
    const chronological = readings.reverse();

    return sendSuccess(res, { trends: chronological }, 'Telemetry trend points retrieved');
  } catch (err) {
    next(err);
  }
};

export const recordBreakdown = async (req, res, next) => {
  try {
    const { assetId, problemDescription, severity = 'Major', observedSymptoms = [] } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return sendError(res, 'Asset not found', 404);

    const breakdown = await Breakdown.create({
      assetId,
      reportedBy: req.user._id,
      breakdownDate: new Date(),
      problemDescription,
      severity,
      observedSymptoms,
      status: 'Reported',
    });

    // Immediate asset status update
    asset.operationalStatus = 'Maintenance';
    asset.currentCondition = severity === 'Catastrophic' ? 'Critical' : 'Warning';
    asset.healthScore = Math.min(asset.healthScore, severity === 'Catastrophic' ? 20 : 45);
    await asset.save();

    // Trigger Notification to Operations & Admin
    await Notification.create({
      title: `Equipment Breakdown Reported: ${asset.name}`,
      message: `${severity} severity breakdown reported: ${problemDescription}`,
      type: 'BREAKDOWN',
      severity: severity === 'Catastrophic' ? 'urgent' : 'warning',
      relatedEntityId: breakdown._id.toString(),
      relatedEntityType: 'Breakdown',
    });

    await logAuditEvent({
      req,
      action: 'REPORT_BREAKDOWN',
      entityName: 'Breakdown',
      entityId: breakdown._id,
      details: `Reported breakdown on ${asset.assetCode} with severity: ${severity}`,
    });

    return sendSuccess(res, { breakdown }, 'Breakdown successfully registered and escalated', 201);
  } catch (err) {
    next(err);
  }
};

export const getBreakdowns = async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const breakdowns = await Breakdown.find(query)
      .sort({ breakdownDate: -1 })
      .populate('assetId', 'name assetCode category location')
      .populate('reportedBy', 'name role');

    return sendSuccess(res, { breakdowns }, 'Breakdowns retrieved');
  } catch (err) {
    next(err);
  }
};

export const createInspection = async (req, res, next) => {
  try {
    const { assetId, checklist = [], conditionRating = 'Good', findings = '', recommendedAction = '' } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return sendError(res, 'Asset not found', 404);

    const inspection = await Inspection.create({
      assetId,
      inspectorId: req.user._id,
      inspectionDate: new Date(),
      checklist,
      conditionRating,
      findings,
      recommendedAction,
    });

    // Update asset last inspection date
    asset.lastInspectionDate = new Date();
    if (conditionRating === 'Critical') {
      asset.currentCondition = 'Critical';
      asset.healthScore = Math.min(asset.healthScore, 35);
    } else if (conditionRating === 'Fair') {
      asset.currentCondition = 'Warning';
    }
    await asset.save();

    await logAuditEvent({
      req,
      action: 'RECORD_INSPECTION',
      entityName: 'Inspection',
      entityId: inspection._id,
      details: `Recorded inspection for ${asset.assetCode} with rating: ${conditionRating}`,
    });

    return sendSuccess(res, { inspection }, 'Inspection checklist submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getInspections = async (req, res, next) => {
  try {
    const { assetId } = req.query;
    const query = {};
    if (assetId) query.assetId = assetId;

    const inspections = await Inspection.find(query)
      .sort({ inspectionDate: -1 })
      .populate('assetId', 'name assetCode category')
      .populate('inspectorId', 'name role');

    return sendSuccess(res, { inspections }, 'Inspections retrieved');
  } catch (err) {
    next(err);
  }
};
