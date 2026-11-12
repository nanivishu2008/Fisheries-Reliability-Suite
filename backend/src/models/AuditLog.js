import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorName: {
      type: String,
      default: 'System',
    },
    actorRole: {
      type: String,
      default: 'System',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityName: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    outcome: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
      index: true,
    },
    details: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Prevent updating or deleting audit logs directly
auditLogSchema.pre('updateOne', function () {
  throw new Error('Audit logs are strictly append-only and cannot be updated');
});
auditLogSchema.pre('deleteOne', function () {
  throw new Error('Audit logs are strictly append-only and cannot be deleted');
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
