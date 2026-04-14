import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
// import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';
// import { initializeSentry } from './config/sentry.config';
// import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Initialize Sentry first (disabled temporarily)
  // initializeSentry();

  // Validate environment variables
  try {
    const env = validateEnv();
    logger.log('✅ Environment variables validated successfully');
  } catch (error) {
    logger.error('❌ Environment validation failed:');
    logger.error(error.message);
    // Sentry.captureException(error);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    // Enable raw body for Paystack webhook signature verification
    rawBody: true,
  });

  // Security headers
  app.use(helmet());

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS - Enhanced configuration
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter with Sentry (disabled temporarily)
  // app.useGlobalFilters(new SentryExceptionFilter());

  // Sentry request handler (must be before routes) (disabled temporarily)
  // app.use(Sentry.Handlers.requestHandler());
  // app.use(Sentry.Handlers.tracingHandler());

  // Swagger API Docs
  const config = new DocumentBuilder()
    .setTitle('RentCred API')
    .setDescription('Tenant Verification Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`RentCred API running on http://localhost:${port}`);
  console.log(`API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
