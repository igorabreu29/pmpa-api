import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeValidateCourseHistoricUseCase } from "@/infra/factories/make-validate-course-historic-use-case.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFound } from "../errors/not-found.ts";
import { ConflictError } from "@/domain/boletim/app/use-cases/errors/conflict-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { ClientError } from "../errors/client-error.ts";

export async function validateCourseHistoric(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/historics/:id/validate', {
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),

        querystring: z.object({
          hash: z.string()
        })
      }
  }, async (req, res) => {
    const { id } = req.params
    const { hash } = req.query

    const useCase = makeValidateCourseHistoricUseCase()
    const result = await useCase.execute({ id, hash })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case ConflictError:
          throw new Conflict(error.message)
        default: 
          throw new ClientError()
      }
    }

    const { message } = result.value

    return res.send({
      message
    })
  })
}