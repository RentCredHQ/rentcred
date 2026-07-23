import { validateEnv } from './env.validation';

/**
 * The production guards matter because .env.example ships a 76-character
 * JWT_SECRET, which satisfies the min-length rule on its own. Copying the
 * example file into production would otherwise boot with a signing key that is
 * published in the repository.
 */
describe('validateEnv', () => {
  const original = process.env;

  const productionEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://user:pw@db.internal:5432/rentcred',
    JWT_SECRET: 'S1sIkA0kq3Xz9vLm2QwR7tYuI4oP6aSdFgHjKlZxCvBnM8eT',
    PAYSTACK_SECRET_KEY: 'sk_live_realkey',
    RESEND_API_KEY: 're_realkey',
    R2_ENDPOINT: 'https://acct.r2.cloudflarestorage.com',
    R2_ACCESS_KEY_ID: 'key',
    R2_SECRET_ACCESS_KEY: 'secret',
    R2_PUBLIC_URL: 'https://pub-abc.r2.dev',
  };

  beforeEach(() => {
    process.env = { ...productionEnv } as any;
  });

  afterAll(() => {
    process.env = original;
  });

  it('accepts a properly configured production environment', () => {
    expect(() => validateEnv()).not.toThrow();
  });

  it('rejects the .env.example JWT_SECRET even though it is long enough', () => {
    process.env.JWT_SECRET =
      'your-super-secret-jwt-key-change-in-production-min-32-characters-required';

    expect(process.env.JWT_SECRET.length).toBeGreaterThan(32);
    expect(() => validateEnv()).toThrow(/JWT_SECRET/);
  });

  it('rejects a localhost DATABASE_URL in production', () => {
    process.env.DATABASE_URL = 'postgresql://rentcred:rentcred@localhost:5433/rentcred';

    expect(() => validateEnv()).toThrow(/DATABASE_URL/);
  });

  it('rejects the published demo admin password', () => {
    process.env.ADMIN_PASSWORD = 'Admin123!';

    expect(() => validateEnv()).toThrow(/ADMIN_PASSWORD/);
  });

  it('rejects demo data creation in production', () => {
    process.env.CREATE_DEMO_DATA = 'true';

    expect(() => validateEnv()).toThrow(/CREATE_DEMO_DATA/);
  });

  it('leaves development environments alone', () => {
    process.env = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://rentcred:rentcred@localhost:5433/rentcred',
      JWT_SECRET: 'your-super-secret-jwt-key-change-in-production-min-32-characters-required',
      CREATE_DEMO_DATA: 'true',
    } as any;

    expect(() => validateEnv()).not.toThrow();
  });
});
