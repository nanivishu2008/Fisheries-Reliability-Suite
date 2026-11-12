import cron from 'node-cron';
import { Asset } from '../models/Asset.js';
import { Telemetry } from '../models/Telemetry.js';
import { FailurePrediction } from '../models/FailurePrediction.js';
import { Notification } from '../models/Notification.js';
import { runHeuristicAssetEvaluation } from '../services/aiService.js';

export const startScheduledJobs = () => {
  console.log('Background telemetry & reliability scheduler initialized.');

  // Run periodic asset health check every 15 minutes (or on startup for immediate demo)
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('Running periodic asset health scoring background job...');
      const assets = await Asset.find({ isDeleted: false, operationalStatus: { $ne: 'Decommissioned' } });

      for (const asset of assets) {
        const recentTelemetry = await Telemetry.find({ assetId: asset._id }).sort({ timestamp: -1 }).limit(5);
        const evalResult = runHeuristicAssetEvaluation(asset, recentTelemetry);

        if (evalResult.riskScore >= 75 && asset.currentCondition !== 'Critical') {
          asset.currentCondition = 'Critical';
          asset.healthScore = Math.min(asset.healthScore, 30);
          await asset.save();

          await Notification.create({
            title: `Degraded Asset Alert: ${asset.name}`,
            message: `Background health evaluation detected critical failure risk (${evalResult.riskScore}%).`,
            type: 'ALERT',
            severity: 'urgent',
            relatedEntityId: asset._id.toString(),
            relatedEntityType: 'Asset',
          });
        }
      }
    } catch (err) {
      console.error('Scheduled job error:', err.message);
    }
  });
};
