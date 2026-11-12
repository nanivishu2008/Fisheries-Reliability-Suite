import mongoose from 'mongoose';

const breakdownSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    breakdownDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    problemDescription: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    severity: {
      type: String,
      enum: ['Minor', 'Major', 'Catastrophic'],
      default: 'Major',
      index: true,
    },
    observedSymptoms: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['Reported', 'Investigating', 'Work Order Created', 'Resolved'],
      default: 'Reported',
      index: true,
    },
    workOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkOrder',
      default: null,
    },
    resolvedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Breakdown = mongoose.model('Breakdown', breakdownSchema);
export default Breakdown;
