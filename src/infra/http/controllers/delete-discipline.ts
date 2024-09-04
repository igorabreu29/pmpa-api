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
import { makeDeleteDisciplineUseCase } from "@/infra/factories/make-delete-discipline-use-case.ts";

export async function deleteDiscipline(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/disciplines/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),
      },
    }, 
  async (req, res) => {
    const { id } = req.params
    const { payload } = req.user

    const useCase = makeDeleteDisciplineUseCase()
    const result = await useCase.execute({
      id,
      role: payload.role
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