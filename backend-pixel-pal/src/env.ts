function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  PORT: process.env['PORT'] ?? '4000',
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  CLOUDFLARE_ACCOUNT_ID: requireEnv('CLOUDFLARE_ACCOUNT_ID'),
  R2_ACCESS_KEY_ID: requireEnv('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: requireEnv('R2_SECRET_ACCESS_KEY'),
  R2_BUCKET_NAME: requireEnv('R2_BUCKET_NAME'),
  R2_PUBLIC_URL: requireEnv('R2_PUBLIC_URL'),
  FRONTEND_URL: process.env['FRONTEND_URL'],
  USER1_USERNAME: process.env['USER1_USERNAME'],
  USER1_PASSWORD: process.env['USER1_PASSWORD'],
  USER2_USERNAME: process.env['USER2_USERNAME'],
  USER2_PASSWORD: process.env['USER2_PASSWORD'],
};
