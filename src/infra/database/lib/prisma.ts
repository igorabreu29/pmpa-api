import { env } from "@/infra/env/index.ts";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient 

if (env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error']
  })
}

if (env.NODE_ENV !== 'production') {
  prisma = new PrismaClient({
    log: ['error', 'query']
  })
}

export {
  prisma
}