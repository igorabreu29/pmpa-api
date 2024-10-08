import { Redis, RedisOptions } from 'ioredis'
import { env } from '../env/index.ts'

export const redisConnection = new Redis(`redis://${env.REDIS_HOST}:6379`, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
})