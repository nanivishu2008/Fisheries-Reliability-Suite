import mongoose from 'mongoose';

const inspectionSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    conditionRating: {
      type: String,
      enum: ['Good', 'Fair', 'Poor', 'Critical'],
      default: 'Good',
    },
    checklist: [
      {
        item: { type: String, required: true },
        status: { type: String, enum: ['Pass', 'Attention', 'Fail'], default: 'Pass' },
        notes: { type: String, default: '' },
      },
    ],
    findings: {
      type: String,
      default: '',
    },
    recommendedAction: {
      type: String,
      default: '',
    },
    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Inspection = mongoose.model('Inspection', inspectionSchema);
export default Inspection;
