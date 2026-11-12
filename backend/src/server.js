import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { startScheduledJobs } from './jobs/scheduledJobs.js';

const startServer = async () => {
  try {
    await connectDB();

    startScheduledJobs();

    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`Fisheries Reliability Suite Backend API Running`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Port: ${config.port}`);
      console.log(`Base URL: http://localhost:${config.port}/api/v1`);
      console.log(`Health Check: http://localhost:${config.port}/api/v1/health`);
      console.log(`Gemini AI Configured: ${!!config.geminiApiKey}`);
      console.log(`====================================================`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('Shutting down API server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Server startup failure:', err);
    process.exit(1);
  }
};

startServer();
