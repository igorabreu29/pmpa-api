import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeChangeUserRoleUseCase } from "@/infra/factories/make-change-user-role-use-case.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

export async function changeUserRole(
  app: FastifyInstance
) {
  app.withTypeProvider<ZodTypeProvider>().patch('/users/:id/role', {
    onRequest: [verifyJWT, verifyUserRole(['dev'])],
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),

      body: z.object({
        role: z.enum(['student', 'admin', 'dev', 'manager'])
      })
    }
  }, 
  async (req, res) => {
    const { id } = req.params
    const { role } = req.body
    const { payload } = req.user

    const useCase = makeChangeUserRoleUseCase()
    const result = await useCase.execute({
      id,
      role,

      userAccess: payload.role
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case NotAllowedError: 
          throw new NotAllowed(error.message)
        case ResourceNotFoundError: 
          throw new NotAllowed(error.message)
        default: 
          throw new ClientError('Houve um erro!')
      }
    }

    return res.status(204).send()
  })
}