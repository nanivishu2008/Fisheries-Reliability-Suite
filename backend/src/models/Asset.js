import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: [true, 'Asset code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Asset category is required'],
      enum: [
        'Ponds',
        'Cages',
        'Vessels',
        'Aerators',
        'Nets',
        'Ice Plants',
        'Cold Rooms',
        'Processing Equipment',
      ],
      index: true,
    },
    subCategory: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location/Unit is required'],
      index: true,
    },
    organization: {
      type: String,
      default: 'AquaReliability Fisheries Ltd',
    },
    owner: {
      type: String,
      default: 'Aquaculture Operations',
    },
    installationDate: {
      type: Date,
      default: Date.now,
    },
    manufacturer: {
      type: String,
      default: 'MarineTech Corp',
    },
    model: {
      type: String,
      default: 'Standard Series',
    },
    serialNumber: {
      type: String,
      default: '',
    },
    criticality: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Mission-Critical'],
      default: 'Medium',
      index: true,
    },
    currentCondition: {
      type: String,
      enum: ['Healthy', 'Warning', 'Critical'],
      default: 'Healthy',
      index: true,
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 95,
      index: true,
    },
    operationalStatus: {
      type: String,
      enum: ['Active', 'Maintenance', 'Standby', 'Decommissioned'],
      default: 'Active',
      index: true,
    },
    runtimeHours: {
      type: Number,
      default: 0,
    },
    maintenanceIntervalHours: {
      type: Number,
      default: 500,
    },
    warrantyExpiry: {
      type: Date,
      default: null,
    },
    lastInspectionDate: {
      type: Date,
      default: null,
    },
    nextMaintenanceDate: {
      type: Date,
      default: null,
    },
    monitoredParameters: [
      {
        parameter: String,
        unit: String,
        minSafeValue: Number,
        maxSafeValue: Number,
        currentValue: Number,
      },
    ],
    assignedVendor: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
assetSchema.index({ name: 'text', assetCode: 'text', location: 'text', manufacturer: 'text' });

export const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
