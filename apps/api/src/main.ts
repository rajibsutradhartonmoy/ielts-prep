import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('IELTS Prep API')
    .setDescription(
      'Multi-tenant IELTS preparation platform API with comprehensive test management, grading, and analytics features'
    )
    .setVersion('1.0')
    .setContact(
      'IELTS Prep Support',
      'https://github.com/yourusername/ielts-prep',
      'support@ielts-prep.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addApiKey({ type: 'apiKey', name: 'X-Organization-Id', in: 'header' }, 'organization-id')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('System Admin', 'System administrator operations')
    .addTag('Organization', 'Organization management')
    .addTag('Users', 'User management')
    .addTag('Students', 'Student management')
    .addTag('Teachers', 'Teacher management')
    .addTag('Batches', 'Batch/class management')
    .addTag('Tests', 'Test creation and management')
    .addTag('Test Assignments', 'Test assignment to students')
    .addTag('Grading', 'Manual grading and feedback')
    .addTag('Analytics', 'Performance analytics and reports')
    .addTag('Notifications', 'Email notifications')
    .addTag('File Upload', 'File upload and management')
    .addTag('Health', 'System health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
