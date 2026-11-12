import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema(
  {
    workOrderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Work order title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'Urgent', 'Emergency'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Reported',
        'Pending Review',
        'Approved',
        'Scheduled',
        'In Progress',
        'Awaiting Verification',
        'Completed',
        'Rejected',
      ],
      default: 'Reported',
      index: true,
    },
    requiredSkill: {
      type: String,
      default: 'Mechanical / Electrical',
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    scheduledDate: {
      type: Date,
      default: null,
      index: true,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    expectedDowntimeHours: {
      type: Number,
      default: 2,
    },
    actualDowntimeHours: {
      type: Number,
      default: 0,
    },
    partsRequired: [
      {
        partNumber: String,
        partName: String,
        quantity: Number,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    approval: {
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      approvedAt: { type: Date, default: null },
      notes: { type: String, default: '' },
    },
    closureVerification: {
      isVerified: { type: Boolean, default: false },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      verifiedAt: { type: Date, default: null },
      notes: { type: String, default: '' },
    },
    evidenceAttachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    actionHistory: [
      {
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actorName: String,
        action: String,
        previousValue: String,
        newValue: String,
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Search indexing
workOrderSchema.index({ workOrderNumber: 'text', title: 'text', description: 'text' });

export const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);
export default WorkOrder;
