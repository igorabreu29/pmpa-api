import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { makeActiveAdministratorUseCase } from "@/infra/factories/make-active-administrator-use-case.ts";
import { makeOnAdministratorActivated } from "@/infra/factories/make-on-administrator-activated.ts";

export async function activeAdministrator(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/administrators/:id/active-status', {
      onRequest: [verifyJWT, verifyUserRole(['dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          reason: z.string().min(3, 'A mensagem não pode ser menor que 3 caracters').max(200, 'A mensagem não pode ser maior que 200 caracteres')
        })
      },
    }, 
  async (req, res) => {
    const { id } = req.params
    const { reason } = req.body
    const { payload } = req.user

    const ip = req.ip

    makeOnAdministratorActivated()
    const useCase = makeActiveAdministratorUseCase()
    const result = await useCase.execute({
      id,
      reason,
      userIp: ip,
      userId: payload.sub,
      role: payload.role,
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case NotAllowedError: 
          throw new NotAllowed()
        default: 
          throw new ClientError()
      }
    }

    return res.status(204).send()
  })
}