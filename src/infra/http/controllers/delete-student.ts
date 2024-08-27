import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeDeleteStudentUseCase } from "@/infra/factories/make-delete-student-use-case.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { makeOnStudentDeleted } from "@/infra/factories/make-on-student-deleted.ts";

export async function deleteStudent(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/students/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      },
    }, 
  async (req, res) => {
    const { id } = req.params
    const { payload: { sub, role } } = req.user

    const ip = req.ip

    makeOnStudentDeleted()
    const useCase = makeDeleteStudentUseCase()
    const result = await useCase.execute({
      id,
      role,
      userId: sub,
      userIp: ip
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case NotAllowedError: 
          throw new NotAllowed('Invalid access level')
        case ResourceNotFoundError:
          throw new NotFound(error.message) 
        default: 
          throw new ClientError('Ocurred something problem')
      }
    }

    return res.status(204).send()
  })
}