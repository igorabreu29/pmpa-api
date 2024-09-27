import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { Environment } from 'vitest'
import { DomainEvents } from '@/core/events/domain-events.ts'
import { Redis } from 'ioredis'
import { env } from '@/infra/env/index.ts'

const prisma = new PrismaClient()
const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
})

function generateDatabaseURL(schema: string) {
    if (!process.env.DATABASE_URL) {
        throw new Error('Please provide a DATABASE_URL environment variable.')
    }

    const url = new URL(process.env.DATABASE_URL)
    url.searchParams.set('schema', schema)

    return url.toString()
}

export default <Environment> {
    name: 'prisma',
    transformMode: 'ssr',
    async setup() {
        await prisma.$connect()

        const schema = randomUUID()
        const databaseURL = generateDatabaseURL(schema)
        
        process.env.DATABASE_URL = databaseURL

        DomainEvents.shouldRun = false

        await redis.flushdb()

        execSync('npx prisma migrate deploy')

        return {
            async teardown() {
                await prisma.$executeRawUnsafe(
                    `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
                )

                await prisma.$disconnect()
            }
        }
    }
}