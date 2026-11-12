import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'Fisheries Smart Asset Reliability & Maintenance Suite',
    timestamp: new Date().toISOString(),
    aiEngineConfigured: !!config.geminiApiKey,
  });
});

// Mount Domain Routes under /api/v1/
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1', telemetryRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1', predictionRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', settingsRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
