import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  APP_PORT: z.coerce.number().min(0).max(65535).default(3000),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  THUMBNAIL_PROXY_URL: z.string().url().optional(),
  STREAMING_PROXY_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;
