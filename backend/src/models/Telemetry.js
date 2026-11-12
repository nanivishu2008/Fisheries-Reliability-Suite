import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    parameter: {
      type: String,
      required: true,
      index: true,
    },
    readingValue: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    operatingContext: {
      type: String,
      default: 'Normal Operations',
    },
    isAnomaly: {
      type: Boolean,
      default: false,
      index: true,
    },
    anomalyReason: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['IOT_GATEWAY', 'MANUAL_ENTRY', 'SCADA_SIMULATOR'],
      default: 'IOT_GATEWAY',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast telemetry trend querying per asset
telemetrySchema.index({ assetId: 1, parameter: 1, timestamp: -1 });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
export default Telemetry;
