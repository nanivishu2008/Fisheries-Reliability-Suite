import { Asset } from '../models/Asset.js';
import { Telemetry } from '../models/Telemetry.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { Inspection } from '../models/Inspection.js';
import { FailurePrediction } from '../models/FailurePrediction.js';
import { Breakdown } from '../models/Breakdown.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAssets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      condition = '',
      status = '',
      location = '',
      criticality = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetCode: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (condition) query.currentCondition = condition;
    if (status) query.operationalStatus = status;
    if (location) query.location = location;
    if (criticality) query.criticality = criticality;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [assets, total] = await Promise.all([
      Asset.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Asset.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      {
        assets,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      'Assets retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const getAssetStats = async (req, res, next) => {
  try {
    const baseQuery = { isDeleted: false };

    const [
      total,
      healthy,
      warning,
      critical,
      underMaintenance,
      openWorkOrders,
      criticalPredictions,
      recentBreakdowns,
      categoryDistribution,
    ] = await Promise.all([
      Asset.countDocuments(baseQuery),
      Asset.countDocuments({ ...baseQuery, currentCondition: 'Healthy' }),
      Asset.countDocuments({ ...baseQuery, currentCondition: 'Warning' }),
      Asset.countDocuments({ ...baseQuery, currentCondition: 'Critical' }),
      Asset.countDocuments({ ...baseQuery, operationalStatus: 'Maintenance' }),
      WorkOrder.countDocuments({ status: { $in: ['Reported', 'Pending Review', 'Approved', 'Scheduled', 'In Progress'] } }),
      FailurePrediction.countDocuments({ riskLevel: { $in: ['High', 'Critical'] }, reviewStatus: 'Pending' }),
      Breakdown.find().sort({ breakdownDate: -1 }).limit(5).populate('assetId', 'name assetCode category location'),
      Asset.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    return sendSuccess(
      res,
      {
        totalAssets: total,
        healthyAssets: healthy,
        warningAssets: warning,
        criticalAssets: critical,
        underMaintenance,
        overdueMaintenance: Math.max(0, warning + critical - underMaintenance),
        openWorkOrders,
        predictedFailures: criticalPredictions,
        recentBreakdowns,
        categoryDistribution: categoryDistribution.map((c) => ({
          category: c._id,
          count: c.count,
        })),
      },
      'Asset telemetry stats calculated'
    );
  } catch (err) {
    next(err);
  }
};

export const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, isDeleted: false });
    if (!asset) return sendError(res, 'Asset record not found', 404);

    // Fetch related records
    const [recentTelemetry, inspections, workOrders, predictions, breakdowns] = await Promise.all([
      Telemetry.find({ assetId: asset._id }).sort({ timestamp: -1 }).limit(20),
      Inspection.find({ assetId: asset._id }).sort({ inspectionDate: -1 }).limit(10).populate('inspectorId', 'name role'),
      WorkOrder.find({ assetId: asset._id }).sort({ createdAt: -1 }).limit(10).populate('assignedTechnician', 'name'),
      FailurePrediction.find({ assetId: asset._id }).sort({ predictionTimestamp: -1 }).limit(5),
      Breakdown.find({ assetId: asset._id }).sort({ breakdownDate: -1 }).limit(5).populate('reportedBy', 'name'),
    ]);

    return sendSuccess(
      res,
      {
        asset,
        recentTelemetry,
        inspections,
        workOrders,
        predictions,
        breakdowns,
      },
      'Asset details retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const createAsset = async (req, res, next) => {
  try {
    const asset = await Asset.create(req.body);

    await logAuditEvent({
      req,
      action: 'CREATE_ASSET',
      entityName: 'Asset',
      entityId: asset._id,
      newState: asset.toObject(),
      details: `Created asset ${asset.assetCode} - ${asset.name}`,
    });

    return sendSuccess(res, { asset }, 'Asset registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset || asset.isDeleted) return sendError(res, 'Asset not found', 404);

    const previousState = asset.toObject();
    Object.assign(asset, req.body);
    await asset.save();

    await logAuditEvent({
      req,
      action: 'UPDATE_ASSET',
      entityName: 'Asset',
      entityId: asset._id,
      previousState,
      newState: asset.toObject(),
      details: `Updated asset specifications for ${asset.assetCode}`,
    });

    return sendSuccess(res, { asset }, 'Asset updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return sendError(res, 'Asset not found', 404);

    asset.isDeleted = true;
    asset.operationalStatus = 'Decommissioned';
    await asset.save();

    await logAuditEvent({
      req,
      action: 'DEACTIVATE_ASSET',
      entityName: 'Asset',
      entityId: asset._id,
      details: `Soft deleted / decommissioned asset ${asset.assetCode}`,
    });

    return sendSuccess(res, {}, 'Asset successfully decommissioned');
  } catch (err) {
    next(err);
  }
};

export const patchAssetStatus = async (req, res, next) => {
  try {
    const { status, condition, healthScore } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return sendError(res, 'Asset not found', 404);

    if (status) asset.operationalStatus = status;
    if (condition) asset.currentCondition = condition;
    if (typeof healthScore === 'number') asset.healthScore = healthScore;

    await asset.save();

    return sendSuccess(res, { asset }, 'Asset status updated');
  } catch (err) {
    next(err);
  }
};
