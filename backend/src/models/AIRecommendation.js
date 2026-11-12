import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    predictionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FailurePrediction',
      default: null,
    },
    recommendationTitle: {
      type: String,
      required: true,
    },
    maintenanceType: {
      type: String,
      enum: ['Preventive Inspection', 'Component Overhaul', 'Lubrication & Balancing', 'Full Replacement'],
      default: 'Component Overhaul',
    },
    recommendedDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'Urgent', 'Emergency'],
      default: 'Medium',
    },
    requiredSkills: [
      {
        type: String,
      },
    ],
    probableSpareParts: [
      {
        type: String,
      },
    ],
    expectedDowntimeHours: {
      type: Number,
      default: 3,
    },
    rationale: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Overridden'],
      default: 'Pending',
      index: true,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    createdWorkOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkOrder',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);
export default AIRecommendation;
