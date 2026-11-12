import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['ASSETS', 'MAINTENANCE_RULES', 'AI_SETTINGS', 'SECURITY', 'TELEMETRY_THRESHOLDS'],
      default: 'ASSETS',
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    lastUpdatedBy: {
      type: String,
      default: 'System Administrator',
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
