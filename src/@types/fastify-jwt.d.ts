import { Role } from '@/domain/boletim/enterprise/entities/authenticate.ts'
import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      payload: {
        sub: string
        role: Role
      }
    }
  }
}