import { z } from 'zod';

/**
 * Fragments of the JWT_SECRET values shipped in .env.example. Matching on a
 * fragment rather than the whole string means a lightly-edited placeholder is
 * still rejected.
 */
const PLACEHOLDER_JWT_SECRETS = [
  'your-super-secret-jwt-key',
  'change-in-production',
  'change-me-in-production',
  'your-secret-minimum-32-characters',
];

const envSchema = z
  .object({
    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // API
    PORT: z.string().optional().default('4000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),

    // Paystack
    PAYSTACK_SECRET_KEY: z.string().default(''),
    PAYSTACK_PUBLIC_KEY: z.string().default(''),

    // Cloudflare R2
    R2_ENDPOINT: z.string().default(''),
    R2_ACCESS_KEY_ID: z.string().default(''),
    R2_SECRET_ACCESS_KEY: z.string().default(''),
    R2_BUCKET: z.string().default('rentcred-uploads'),
    R2_PUBLIC_URL: z.string().default(''),

    // Email (Resend)
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
  })
  .superRefine((data, ctx) => {
    // In production, enforce that critical secrets are set and not placeholders
    if (data.NODE_ENV === 'production') {
      // The .env.example JWT_SECRET is 76 characters, so the length rule alone
      // happily accepts it. Copying .env.example to .env would otherwise boot
      // production with a signing key published in the repository, letting
      // anyone mint valid tokens for any account.
      if (PLACEHOLDER_JWT_SECRETS.some((p) => data.JWT_SECRET.includes(p))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'JWT_SECRET is still the example placeholder — generate a unique secret',
          path: ['JWT_SECRET'],
        });
      }
      if (/localhost|127\.0\.0\.1|example\.com/.test(data.DATABASE_URL)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'DATABASE_URL still points at a local/example host in production',
          path: ['DATABASE_URL'],
        });
      }
      if (data.ADMIN_PASSWORD && data.ADMIN_PASSWORD === 'Admin123!') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ADMIN_PASSWORD is the published demo password — set a real one',
          path: ['ADMIN_PASSWORD'],
        });
      }
      if (data.CREATE_DEMO_DATA === 'true') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CREATE_DEMO_DATA must not be true in production',
          path: ['CREATE_DEMO_DATA'],
        });
      }
      if (!data.PAYSTACK_SECRET_KEY || data.PAYSTACK_SECRET_KEY.includes('dummy') || data.PAYSTACK_SECRET_KEY.includes('placeholder')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'PAYSTACK_SECRET_KEY must be a real key in production', path: ['PAYSTACK_SECRET_KEY'] });
      }
      if (!data.RESEND_API_KEY || data.RESEND_API_KEY.includes('dummy')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RESEND_API_KEY is required in production', path: ['RESEND_API_KEY'] });
      }
      if (!data.R2_ENDPOINT) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'R2_ENDPOINT is required in production', path: ['R2_ENDPOINT'] });
      }
      if (!data.R2_ACCESS_KEY_ID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'R2_ACCESS_KEY_ID is required in production', path: ['R2_ACCESS_KEY_ID'] });
      }
      if (!data.R2_SECRET_ACCESS_KEY) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'R2_SECRET_ACCESS_KEY is required in production', path: ['R2_SECRET_ACCESS_KEY'] });
      }
      if (!data.R2_PUBLIC_URL) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'R2_PUBLIC_URL is required in production', path: ['R2_PUBLIC_URL'] });
      }
    }
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
