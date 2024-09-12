import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'production', 'test']).default('dev'),
  WEB_PORT: z.coerce.number().default(5173),
  API_PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)