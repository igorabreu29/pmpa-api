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
import { makeUpdateDisciplineUseCase } from "@/infra/factories/make-update-discipline-use-case.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { Conflict } from "../errors/conflict-error.ts";

export async function updateDiscipline(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/disciplines/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),
        body: z.object({
          name: z.string().optional()
        })
      },
    }, 
  async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    const { payload } = req.user

    const useCase = makeUpdateDisciplineUseCase()
    const result = await useCase.execute({
      id,
      name,

      role: payload.role
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case InvalidNameError: 
          throw new Conflict(error.message)
        case NotAllowedError: 
          throw new NotAllowed()
        default: 
          throw new ClientError()
      }
    }

    return res.status(204).send()
  })
}