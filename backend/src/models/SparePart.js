import mongoose from 'mongoose';

const sparePartSchema = new mongoose.Schema(
  {
    partNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Mechanical', 'Electrical', 'Refrigeration', 'Structural', 'Sensory', 'Consumables'],
      index: true,
    },
    compatibleCategories: [
      {
        type: String,
      },
    ],
    quantityOnHand: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimumStockLevel: {
      type: Number,
      required: true,
      default: 2,
    },
    unitCost: {
      type: Number,
      required: true,
      default: 0,
    },
    leadTimeDays: {
      type: Number,
      default: 7,
    },
    supplier: {
      type: String,
      default: 'Maritime Spares Ltd',
    },
    storageBin: {
      type: String,
      default: 'Warehouse A - Rack 3',
    },
  },
  {
    timestamps: true,
  }
);

export const SparePart = mongoose.model('SparePart', sparePartSchema);
export default SparePart;
