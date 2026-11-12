import mongoose from 'mongoose';

const failurePredictionSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    failureType: {
      type: String,
      required: true,
      index: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
      index: true,
    },
    remainingUsefulLifeHours: {
      type: Number,
      required: true,
    },
    confidenceScore: {
      type: Number,
      default: 0.85,
    },
    contributingFactors: [
      {
        factor: String,
        severity: String,
        description: String,
      },
    ],
    sourceDataSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    explanation: {
      type: String,
      required: true,
    },
    modelVersion: {
      type: String,
      default: 'HEURISTIC-EXPLAINABLE-v2.1',
    },
    engineType: {
      type: String,
      enum: ['GEMINI_AI', 'HEURISTIC_EXPLAINABLE'],
      default: 'HEURISTIC_EXPLAINABLE',
    },
    predictionTimestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Dismissed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export const FailurePrediction = mongoose.model('FailurePrediction', failurePredictionSchema);
export default FailurePrediction;
