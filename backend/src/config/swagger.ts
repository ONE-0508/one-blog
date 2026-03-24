import path from 'node:path';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ONE Blog Backend API',
      version: '1.0.0',
      description: '博客后端接口文档（Swagger/OpenAPI）',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || `http://localhost:${process.env.PORT || '3001'}`,
        description: '当前运行环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Invalid request' },
                code: { type: 'number', example: 400 },
              },
            },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: '操作成功' },
              },
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'OK' },
                timestamp: { type: 'string', format: 'date-time' },
                uptime: { type: 'number', example: 1200 },
                environment: { type: 'string', example: 'production' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user_123' },
            username: { type: 'string', example: 'oneone' },
            email: { type: 'string', example: 'oneone@example.com' },
            displayName: { type: 'string', example: 'One One' },
            role: { type: 'string', example: 'admin' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        AuthLoginRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            email: { type: 'string', example: 'admin@example.com' },
            username: { type: 'string', example: 'oneone' },
            password: { type: 'string', example: 'admin123456' },
          },
        },
        AuthRegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', example: 'oneone' },
            email: { type: 'string', example: 'oneone@example.com' },
            password: { type: 'string', example: 'P@ssw0rd123' },
            displayName: { type: 'string', example: 'One One' },
          },
        },
        AuthLoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                tokens: { $ref: '#/components/schemas/AuthTokens' },
              },
            },
          },
        },
        AuthRefreshResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/AuthTokens' },
          },
        },
        AuthMeResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        AuthValidateResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                valid: { type: 'boolean', example: true },
                userId: { type: 'string', nullable: true },
                role: { type: 'string', nullable: true },
                expiresAt: { type: 'number', nullable: true },
                error: { type: 'string', nullable: true },
              },
            },
          },
        },
        ArticleAuthor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            avatarUrl: { type: 'string' },
          },
        },
        Article: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'article_123' },
            title: { type: 'string', example: '文章标题' },
            content: { type: 'string', example: '文章内容（Markdown）' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['前端', '工程化'],
            },
            author: { $ref: '#/components/schemas/ArticleAuthor' },
            viewCount: { type: 'number', example: 12 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ArticleCreateRequest: {
          type: 'object',
          required: ['title', 'content', 'tags'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        ArticleUpdateRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        ArticleListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Article' },
                },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
              },
            },
          },
        },
        ArticleDetailResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                article: { $ref: '#/components/schemas/Article' },
              },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.ts'), path.join(__dirname, '../app.ts')],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
