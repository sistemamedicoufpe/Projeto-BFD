import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:5173',
    credentials: true,
  });

  // Security
  app.use(helmet());
  app.use(compression());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto convert types
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('NeuroCare Diagnostic API')
    .setDescription('Sistema de Avaliação Neurológica e Diagnóstico de Demências')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Endpoints de autenticação e gerenciamento de usuários')
    .addTag('Patients', 'Gestão de pacientes')
    .addTag('Evaluations', 'Avaliações neurológicas')
    .addTag('Exams', 'Exames médicos')
    .addTag('Reports', 'Relatórios e laudos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`
    🚀 NeuroCare Backend is running!

    📍 Server: http://localhost:${port}
    📍 API: http://localhost:${port}/${apiPrefix}
    📍 Docs: http://localhost:${port}/api/docs
    📍 Health: http://localhost:${port}/${apiPrefix}/health

    Environment: ${configService.get('NODE_ENV') || 'development'}
  `);
}

bootstrap();
