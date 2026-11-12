import { WorkOrder } from '../models/WorkOrder.js';
import { Asset } from '../models/Asset.js';
import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getWorkOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      priority = '',
      technicianId = '',
      assetId = '',
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { workOrderNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (technicianId) query.assignedTechnician = technicianId;
    if (assetId) query.assetId = assetId;

    // Role-based scoping: Technicians default to their own assigned queue if requested
    if (req.user.role === 'Technician' && req.query.myTasks === 'true') {
      query.assignedTechnician = req.user._id;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [workOrders, total] = await Promise.all([
      WorkOrder.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('assetId', 'name assetCode category location currentCondition')
        .populate('assignedTechnician', 'name role email')
        .populate('approval.approvedBy', 'name')
        .populate('closureVerification.verifiedBy', 'name'),
      WorkOrder.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      {
        workOrders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      'Work orders retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const createWorkOrder = async (req, res, next) => {
  try {
    const count = await WorkOrder.countDocuments();
    const workOrderNumber = `WO-2026-${String(count + 1).padStart(4, '0')}`;

    const workOrder = await WorkOrder.create({
      ...req.body,
      workOrderNumber,
      actionHistory: [
        {
          actor: req.user._id,
          actorName: req.user.name,
          action: 'CREATED',
          previousValue: '',
          newValue: req.body.status || 'Reported',
          reason: 'Initial creation',
          timestamp: new Date(),
        },
      ],
    });

    // Notify assigned technician if any
    if (workOrder.assignedTechnician) {
      await Notification.create({
        recipientId: workOrder.assignedTechnician,
        title: `Assigned Work Order: ${workOrder.workOrderNumber}`,
        message: `You have been assigned to ${workOrder.title}`,
        type: 'MAINTENANCE',
        severity: workOrder.priority === 'Emergency' ? 'urgent' : 'info',
        relatedEntityId: workOrder._id.toString(),
        relatedEntityType: 'WorkOrder',
      });
    }

    await logAuditEvent({
      req,
      action: 'CREATE_WORK_ORDER',
      entityName: 'WorkOrder',
      entityId: workOrder._id,
      newState: workOrder.toObject(),
      details: `Created work order ${workOrder.workOrderNumber} - ${workOrder.title}`,
    });

    return sendSuccess(res, { workOrder }, 'Work order successfully created', 201);
  } catch (err) {
    next(err);
  }
};

export const getWorkOrderById = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('assetId')
      .populate('assignedTechnician', 'name role email phone')
      .populate('approval.approvedBy', 'name role')
      .populate('closureVerification.verifiedBy', 'name role');

    if (!workOrder) return sendError(res, 'Work order not found', 404);
    return sendSuccess(res, { workOrder }, 'Work order details retrieved');
  } catch (err) {
    next(err);
  }
};

export const moveWorkOrderStatus = async (req, res, next) => {
  try {
    const { newStatus, reason = 'Kanban transition' } = req.body;
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return sendError(res, 'Work order not found', 404);

    const oldStatus = workOrder.status;
    workOrder.status = newStatus;

    if (newStatus === 'Completed') {
      workOrder.completedDate = new Date();
    }

    workOrder.actionHistory.push({
      actor: req.user._id,
      actorName: req.user.name,
      action: 'STATUS_CHANGE',
      previousValue: oldStatus,
      newValue: newStatus,
      reason,
      timestamp: new Date(),
    });

    await workOrder.save();

    await logAuditEvent({
      req,
      action: 'MOVE_WORK_ORDER',
      entityName: 'WorkOrder',
      entityId: workOrder._id,
      previousState: { status: oldStatus },
      newState: { status: newStatus },
      details: `Transitioned status from ${oldStatus} to ${newStatus}`,
    });

    return sendSuccess(res, { workOrder }, `Work order moved to ${newStatus}`);
  } catch (err) {
    next(err);
  }
};

export const approveWorkOrder = async (req, res, next) => {
  try {
    const { notes = 'Approved for scheduling' } = req.body;
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return sendError(res, 'Work order not found', 404);

    const oldStatus = workOrder.status;
    workOrder.status = 'Approved';
    workOrder.approval = {
      approvedBy: req.user._id,
      approvedAt: new Date(),
      notes,
    };

    workOrder.actionHistory.push({
      actor: req.user._id,
      actorName: req.user.name,
      action: 'APPROVED',
      previousValue: oldStatus,
      newValue: 'Approved',
      reason: notes,
      timestamp: new Date(),
    });

    await workOrder.save();

    await logAuditEvent({
      req,
      action: 'APPROVE_WORK_ORDER',
      entityName: 'WorkOrder',
      entityId: workOrder._id,
      details: `Approved work order ${workOrder.workOrderNumber}`,
    });

    return sendSuccess(res, { workOrder }, 'Work order approved');
  } catch (err) {
    next(err);
  }
};

export const rejectWorkOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return sendError(res, 'Rejection reason is mandatory', 400);

    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return sendError(res, 'Work order not found', 404);

    const oldStatus = workOrder.status;
    workOrder.status = 'Rejected';
    workOrder.approval = {
      approvedBy: req.user._id,
      approvedAt: new Date(),
      notes: `Rejected: ${reason}`,
    };

    workOrder.actionHistory.push({
      actor: req.user._id,
      actorName: req.user.name,
      action: 'REJECTED',
      previousValue: oldStatus,
      newValue: 'Rejected',
      reason,
      timestamp: new Date(),
    });

    await workOrder.save();

    await logAuditEvent({
      req,
      action: 'REJECT_WORK_ORDER',
      entityName: 'WorkOrder',
      entityId: workOrder._id,
      details: `Rejected work order ${workOrder.workOrderNumber}: ${reason}`,
    });

    return sendSuccess(res, { workOrder }, 'Work order rejected');
  } catch (err) {
    next(err);
  }
};

export const verifyClosure = async (req, res, next) => {
  try {
    const { notes = 'Physical verification complete. Equipment operational.' } = req.body;
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return sendError(res, 'Work order not found', 404);

    const oldStatus = workOrder.status;
    workOrder.status = 'Completed';
    workOrder.completedDate = new Date();
    workOrder.closureVerification = {
      isVerified: true,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      notes,
    };

    workOrder.actionHistory.push({
      actor: req.user._id,
      actorName: req.user.name,
      action: 'CLOSURE_VERIFIED',
      previousValue: oldStatus,
      newValue: 'Completed',
      reason: notes,
      timestamp: new Date(),
    });

    await workOrder.save();

    // Reset asset condition back to Healthy and reset status back to Active
    const asset = await Asset.findById(workOrder.assetId);
    if (asset) {
      asset.operationalStatus = 'Active';
      asset.currentCondition = 'Healthy';
      asset.healthScore = 96;
      asset.lastInspectionDate = new Date();
      await asset.save();
    }

    await logAuditEvent({
      req,
      action: 'VERIFY_CLOSURE',
      entityName: 'WorkOrder',
      entityId: workOrder._id,
      details: `Authorized closure verification for ${workOrder.workOrderNumber}`,
    });

    return sendSuccess(res, { workOrder }, 'Closure verification successfully confirmed. Asset returned to active service.');
  } catch (err) {
    next(err);
  }
};

export const getCalendarEvents = async (req, res, next) => {
  try {
    const workOrders = await WorkOrder.find({
      scheduledDate: { $ne: null },
    })
      .populate('assetId', 'name assetCode category location currentCondition')
      .populate('assignedTechnician', 'name');

    const events = workOrders.map((wo) => ({
      id: wo._id,
      title: `${wo.workOrderNumber}: ${wo.title}`,
      assetName: wo.assetId?.name || 'Asset',
      assetCode: wo.assetId?.assetCode || '',
      date: wo.scheduledDate,
      priority: wo.priority,
      status: wo.status,
      technician: wo.assignedTechnician?.name || 'Unassigned',
      expectedDowntimeHours: wo.expectedDowntimeHours,
    }));

    return sendSuccess(res, { events }, 'Calendar events retrieved');
  } catch (err) {
    next(err);
  }
};
