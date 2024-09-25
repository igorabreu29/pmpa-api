import { Redis, RedisOptions } from 'ioredis'
import { env } from '../env/index.ts'

const options: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT
}

export const redisConnection = new Redis(options)