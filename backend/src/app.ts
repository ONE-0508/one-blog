import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { apiLimiter } from '@/middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from '@/middlewares/errorHandler';
import logger from '@/config/logger';
import { testDatabaseConnection, syncDatabase } from '@/config/database';
import authRoutes from '@/routes/auth.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize all middlewares
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) {
            return callback(null, true);
          }

          if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            logger.warn(msg);
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        },
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(
      morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      })
    );

    // Rate limiting (apply to all routes)
    this.app.use(apiLimiter);
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'OK',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV,
        },
      });
    });

    // API version prefix
    this.app.use('/api/v1', (_req: Request, res: Response, next: NextFunction) => {
      // API version header
      res.setHeader('X-API-Version', '1.0.0');
      next();
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    // this.app.use('/api/v1/articles', articleRoutes);
    // this.app.use('/api/v1/notes', noteRoutes);
    // this.app.use('/api/v1/comments', commentRoutes);
    // this.app.use('/api/v1/projects', projectRoutes);

    // Root endpoint
    this.app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        data: {
          message: 'Blog API Server',
          version: '1.0.0',
          documentation: '/api/docs', // TODO: Add Swagger/OpenAPI docs
          endpoints: {
            health: '/health',
            api: '/api/v1',
          },
        },
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(port: number): Promise<void> {
    // 在开发环境中，如果数据库连接失败，仍然启动服务器（用于开发和测试）
    if (process.env.NODE_ENV === 'development') {
      try {
        const isDbConnected = await testDatabaseConnection();
        if (!isDbConnected) {
          logger.warn(
            'Database connection failed in development mode, but server will start anyway for testing.'
          );
        } else {
          // 开发环境同步数据库
          try {
            await syncDatabase(false); // 不强制同步，保留现有数据
            logger.info('Database synchronized for development');
          } catch (error) {
            logger.warn('Database synchronization failed, continuing anyway:', error);
          }
        }
      } catch (error) {
        logger.warn(
          'Database connection test failed in development mode, but server will start anyway:',
          error
        );
      }
    } else {
      // 生产环境必须连接数据库
      const isDbConnected = await testDatabaseConnection();
      if (!isDbConnected) {
        logger.error('Failed to connect to database. Server will not start.');
        process.exit(1);
      }
    }

    this.app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${port}/health`);
      logger.info(`Auth endpoints: http://localhost:${port}/api/v1/auth`);
    });
  }
}

export default App;
