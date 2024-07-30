import { Role } from '@/domain/boletim/enterprise/entities/authenticate.ts'
import { FastifyReply, FastifyRequest } from 'fastify'

export function verifyUserRole(rolesToVerify: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { payload: { role } } = request.user

    if (!rolesToVerify.includes(role)) {
      return reply.status(401).send({ message: 'Unauthorized.' })
    }
  }
}