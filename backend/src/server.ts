import 'dotenv/config';
import App from '@/app';
import logger from '@/config/logger';

/**
 * Validate required environment variables
 */
const validateEnv = (): void => {
  const requiredEnvVars = ['NODE_ENV', 'PORT', 'JWT_SECRET'];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }

  // Validate JWT secret in production
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production'
  ) {
    logger.error('JWT_SECRET must be changed in production environment');
    process.exit(1);
  }
};

/**
 * Handle uncaught exceptions and unhandled rejections
 */
const setupErrorHandlers = (): void => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    // In production, we might want to restart the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, we might want to restart the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  // Handle SIGTERM for graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Starting graceful shutdown...');
    // TODO: Add cleanup logic (close database connections, etc.)
    process.exit(0);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    logger.info('SIGINT received. Starting graceful shutdown...');
    // TODO: Add cleanup logic
    process.exit(0);
  });
};

/**
 * Main application entry point
 */
const main = (): void => {
  try {
    // Validate environment variables
    validateEnv();

    // Setup error handlers
    setupErrorHandlers();

    // Create and start the app
    const app = new App();
    const port = parseInt(process.env.PORT || '3001', 10);

    app.start(port);

    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
};

// Start the application
main();
