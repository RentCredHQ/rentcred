import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // API
  PORT: z.string().optional().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Paystack (in dev mode, can be dummy values)
  PAYSTACK_SECRET_KEY: z.string().default('sk_test_dummy'),
  PAYSTACK_PUBLIC_KEY: z.string().default('pk_test_dummy'),

  // AWS S3 (in dev mode, can be optional)
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
  AWS_S3_BUCKET: z.string().default('rentcred-uploads'),
  S3_ENDPOINT: z.string().optional(),

  // Email (Resend) - optional in dev
  RESEND_API_KEY: z.string().default(''),
  RESEND_FROM_EMAIL: z.string().default('noreply@rentcred.ng'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().optional().default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // SMS Provider (Optional)
  SMS_PROVIDER_API_KEY: z.string().optional(),
  SMS_PROVIDER_SENDER_ID: z.string().optional(),
  TERMII_API_KEY: z.string().optional(),
  TERMII_SENDER_ID: z.string().optional(),

  // Rate Limiting
  THROTTLE_TTL: z.string().optional().default('60'),
  THROTTLE_LIMIT: z.string().optional().default('100'),

  // Seed Configuration
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  CREATE_DEMO_DATA: z.string().optional(),

  // Error Tracking
  SENTRY_DSN: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${missing}`);
    }
    throw error;
  }
}
