import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'production', 'test']).default('dev'),
  WEB_PORT: z.coerce.number().default(5173),
  WEB_URL: z.string().url(),
  API_PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
})

export const env = envSchema.parse(process.env)