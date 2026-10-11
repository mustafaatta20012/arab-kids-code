import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Arab Kids Code API Specification',
    version: '1.0.0',
    description: 'RESTful API for Arab Kids Code educational platform (Scratch & Game Design for kids 6-14)',
    contact: {
      name: 'Eng. Mustafa Atta (م. مصطفى عطا)',
      phone: '+201101587881',
      whatsapp: '+201101587881',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        responses: {
          200: { description: 'API Server is healthy' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User Login (Parent, Student, Teacher)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  identifier: { type: 'string', example: 'teacher@arabkidscode.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Successful authentication' },
          401: { description: 'Invalid credentials or locked account' },
        },
      },
    },
    '/public/course': {
      get: {
        summary: 'Get Public Course Info & Curriculum Stats',
        responses: {
          200: { description: 'Course details' },
        },
      },
    },
    '/public/lessons/free': {
      get: {
        summary: 'Get Free First Lesson (Binary System)',
        responses: {
          200: { description: 'Lesson 1 details' },
        },
      },
    },
    '/public/reviews': {
      get: {
        summary: 'Get Teacher-Approved Reviews',
        responses: {
          200: { description: 'List of public reviews' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📖 OpenAPI Swagger docs available at /api/v1/docs');
};
