import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { makeDeleteManagerUseCase } from "@/infra/factories/make-delete-manager-use-case.ts";
import { makeOnManagerDeleted } from "@/infra/factories/make-on-manager-deleted.ts";

export async function deleteManager(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/managers/:id', {
      onRequest: [verifyJWT, verifyUserRole(['dev'])],
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

    makeOnManagerDeleted()
    const useCase = makeDeleteManagerUseCase()
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
          throw new NotAllowed('Nível de acesso inválido')
        case ResourceNotFoundError:
          throw new NotFound(error.message) 
        default: 
          throw new ClientError('Houve algum problema')
      }
    }

    return res.status(204).send()
  })
}