import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    roleTarget: {
      type: String,
      default: '',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['MAINTENANCE', 'ALERT', 'APPROVAL', 'AI_PREDICTION', 'BREAKDOWN', 'SYSTEM'],
      default: 'ALERT',
      index: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'urgent'],
      default: 'info',
    },
    relatedEntityId: {
      type: String,
      default: '',
    },
    relatedEntityType: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
