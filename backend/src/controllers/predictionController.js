import { FailurePrediction } from '../models/FailurePrediction.js';
import { AIRecommendation } from '../models/AIRecommendation.js';
import { Asset } from '../models/Asset.js';
import { Telemetry } from '../models/Telemetry.js';
import { Breakdown } from '../models/Breakdown.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { Notification } from '../models/Notification.js';
import { generateGeminiPrediction } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const runPredictionEvaluation = async (req, res, next) => {
  try {
    const { assetId } = req.body;
    let targetAssets = [];

    if (assetId) {
      const asset = await Asset.findById(assetId);
      if (!asset) return sendError(res, 'Target asset not found', 404);
      targetAssets = [asset];
    } else {
      // Run for up to 10 active assets
      targetAssets = await Asset.find({ isDeleted: false, operationalStatus: { $ne: 'Decommissioned' } }).limit(10);
    }

    const createdPredictions = [];

    for (const asset of targetAssets) {
      const [telemetry, breakdowns] = await Promise.all([
        Telemetry.find({ assetId: asset._id }).sort({ timestamp: -1 }).limit(15),
        Breakdown.find({ assetId: asset._id }).sort({ breakdownDate: -1 }).limit(3),
      ]);

      const evalResult = await generateGeminiPrediction(asset, telemetry, breakdowns);

      const prediction = await FailurePrediction.create({
        assetId: asset._id,
        failureType: evalResult.failureType,
        riskScore: evalResult.riskScore,
        riskLevel: evalResult.riskLevel,
        remainingUsefulLifeHours: evalResult.remainingUsefulLifeHours,
        confidenceScore: evalResult.confidenceScore || 0.85,
        contributingFactors: evalResult.contributingFactors || [],
        sourceDataSnapshot: {
          runtimeHours: asset.runtimeHours,
          currentCondition: asset.currentCondition,
          telemetryCount: telemetry.length,
        },
        explanation: evalResult.explanation,
        modelVersion: evalResult.modelVersion,
        engineType: evalResult.engineType,
        predictionTimestamp: new Date(),
        reviewStatus: 'Pending',
      });

      // Update asset health score and condition if higher risk detected
      if (evalResult.riskScore >= 75) {
        asset.currentCondition = 'Critical';
        asset.healthScore = Math.min(asset.healthScore, 30);
        await asset.save();
      } else if (evalResult.riskScore >= 50) {
        asset.currentCondition = 'Warning';
        asset.healthScore = Math.min(asset.healthScore, 65);
        await asset.save();
      }

      // Automatically generate actionable AI maintenance recommendation
      const recData = evalResult.recommendation || {
        title: `Service Action for ${evalResult.failureType}`,
        maintenanceType: 'Component Overhaul',
        priority: evalResult.riskLevel === 'Critical' ? 'Urgent' : 'Medium',
        expectedDowntimeHours: 4,
        requiredSkills: ['Marine Electrical', 'Mechanical Reliability'],
        probableSpareParts: ['Bearings', 'Seals', 'Synthetic Lubricant'],
      };

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (evalResult.riskLevel === 'Critical' ? 2 : 7));

      const recommendation = await AIRecommendation.create({
        assetId: asset._id,
        predictionId: prediction._id,
        recommendationTitle: recData.title,
        maintenanceType: recData.maintenanceType || 'Component Overhaul',
        recommendedDate: scheduledDate,
        priority: recData.priority || 'Medium',
        requiredSkills: recData.requiredSkills || ['Mechanical Reliability'],
        probableSpareParts: recData.probableSpareParts || ['Filter Kit'],
        expectedDowntimeHours: recData.expectedDowntimeHours || 3,
        rationale: evalResult.explanation,
        status: 'Pending',
      });

      // Notify operations of high-risk prediction
      if (['High', 'Critical'].includes(evalResult.riskLevel)) {
        await Notification.create({
          title: `AI Failure Risk Alert: ${asset.name}`,
          message: `${evalResult.failureType} predicted with ${evalResult.riskScore}% risk. Estimated RUL: ${evalResult.remainingUsefulLifeHours} hours.`,
          type: 'AI_PREDICTION',
          severity: evalResult.riskLevel === 'Critical' ? 'urgent' : 'warning',
          relatedEntityId: prediction._id.toString(),
          relatedEntityType: 'FailurePrediction',
        });
      }

      createdPredictions.push({ prediction, recommendation });
    }

    await logAuditEvent({
      req,
      action: 'RUN_AI_EVALUATION',
      entityName: 'FailurePrediction',
      details: `Generated ${createdPredictions.length} failure risk predictions`,
    });

    return sendSuccess(res, { predictions: createdPredictions }, 'AI failure evaluations completed', 201);
  } catch (err) {
    next(err);
  }
};

export const getPredictions = async (req, res, next) => {
  try {
    const { riskLevel, assetId, limit = 50 } = req.query;
    const query = {};
    if (riskLevel) query.riskLevel = riskLevel;
    if (assetId) query.assetId = assetId;

    const predictions = await FailurePrediction.find(query)
      .sort({ predictionTimestamp: -1 })
      .limit(parseInt(limit, 10))
      .populate('assetId', 'name assetCode category location currentCondition healthScore');

    return sendSuccess(res, { predictions }, 'Predictions retrieved');
  } catch (err) {
    next(err);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const { status, assetId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assetId) query.assetId = assetId;

    const recommendations = await AIRecommendation.find(query)
      .sort({ createdAt: -1 })
      .populate('assetId', 'name assetCode category location currentCondition')
      .populate('predictionId')
      .populate('reviewedBy', 'name role')
      .populate('createdWorkOrderId', 'workOrderNumber status');

    return sendSuccess(res, { recommendations }, 'AI Recommendations retrieved');
  } catch (err) {
    next(err);
  }
};

export const acceptRecommendation = async (req, res, next) => {
  try {
    const rec = await AIRecommendation.findById(req.params.id).populate('assetId');
    if (!rec) return sendError(res, 'Recommendation not found', 404);

    const count = await WorkOrder.countDocuments();
    const workOrderNumber = `WO-2026-${String(count + 1).padStart(4, '0')}`;

    // Create Work Order directly from recommendation
    const workOrder = await WorkOrder.create({
      workOrderNumber,
      assetId: rec.assetId._id,
      title: `[AI PdM] ${rec.recommendationTitle}`,
      description: `Generated from AI Recommendation: ${rec.rationale}`,
      priority: rec.priority,
      status: 'Approved',
      requiredSkill: rec.requiredSkills?.[0] || 'Reliability Maintenance',
      scheduledDate: rec.recommendedDate,
      expectedDowntimeHours: rec.expectedDowntimeHours,
      partsRequired: (rec.probableSpareParts || []).map((p) => ({
        partName: p,
        quantity: 1,
        isAvailable: true,
      })),
      approval: {
        approvedBy: req.user._id,
        approvedAt: new Date(),
        notes: 'Directly approved from AI predictive recommendation.',
      },
    });

    rec.status = 'Approved';
    rec.reviewedBy = req.user._id;
    rec.reviewedAt = new Date();
    rec.createdWorkOrderId = workOrder._id;
    rec.reviewNotes = req.body.notes || 'Accepted AI recommendation and generated approved work order.';
    await rec.save();

    await logAuditEvent({
      req,
      action: 'APPROVE_AI_RECOMMENDATION',
      entityName: 'AIRecommendation',
      entityId: rec._id,
      details: `Accepted recommendation and spawned Work Order ${workOrder.workOrderNumber}`,
    });

    return sendSuccess(res, { recommendation: rec, workOrder }, 'Recommendation approved and work order scheduled');
  } catch (err) {
    next(err);
  }
};

export const rejectRecommendation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return sendError(res, 'Rejection reason is mandatory', 400);

    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) return sendError(res, 'Recommendation not found', 404);

    rec.status = 'Rejected';
    rec.reviewedBy = req.user._id;
    rec.reviewedAt = new Date();
    rec.reviewNotes = reason;
    await rec.save();

    await logAuditEvent({
      req,
      action: 'REJECT_AI_RECOMMENDATION',
      entityName: 'AIRecommendation',
      entityId: rec._id,
      details: `Rejected recommendation: ${reason}`,
    });

    return sendSuccess(res, { recommendation: rec }, 'Recommendation rejected');
  } catch (err) {
    next(err);
  }
};

export const overrideRecommendation = async (req, res, next) => {
  try {
    const { overrideReason, customDate, customPriority, customNotes } = req.body;
    if (!overrideReason) return sendError(res, 'Override justification reason is required', 400);

    const rec = await AIRecommendation.findById(req.params.id).populate('assetId');
    if (!rec) return sendError(res, 'Recommendation not found', 404);

    const count = await WorkOrder.countDocuments();
    const workOrderNumber = `WO-2026-${String(count + 1).padStart(4, '0')}`;

    const workOrder = await WorkOrder.create({
      workOrderNumber,
      assetId: rec.assetId._id,
      title: `[Manager Override] ${rec.recommendationTitle}`,
      description: `Manual Override: ${customNotes || overrideReason}`,
      priority: customPriority || rec.priority,
      status: 'Approved',
      scheduledDate: customDate ? new Date(customDate) : rec.recommendedDate,
      expectedDowntimeHours: rec.expectedDowntimeHours,
      approval: {
        approvedBy: req.user._id,
        approvedAt: new Date(),
        notes: `Manager Override: ${overrideReason}`,
      },
    });

    rec.status = 'Overridden';
    rec.reviewedBy = req.user._id;
    rec.reviewedAt = new Date();
    rec.reviewNotes = `Overridden: ${overrideReason}`;
    rec.createdWorkOrderId = workOrder._id;
    await rec.save();

    await logAuditEvent({
      req,
      action: 'OVERRIDE_AI_RECOMMENDATION',
      entityName: 'AIRecommendation',
      entityId: rec._id,
      details: `Overrode recommendation with custom parameters: ${overrideReason}`,
    });

    return sendSuccess(res, { recommendation: rec, workOrder }, 'Recommendation successfully overridden with custom plan');
  } catch (err) {
    next(err);
  }
};
