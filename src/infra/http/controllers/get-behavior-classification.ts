import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { makeGetCourseBehaviorClassificationUseCase } from "@/infra/factories/make-get-course-behavior-classification-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";

export async function getBehaviorClassification(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/classification/behaviors', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().cuid(),
        }),

        querystring: z.object({
          page: z.coerce.number().default(1)
        })
      },
    }, async (req, res) => {
      const { id } = req.params
      const { page } = req.query

      const useCase = makeGetCourseBehaviorClassificationUseCase()
      const result = await useCase.execute({
        courseId: id,
        page
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError: 
            throw new NotFound(error.message)
          default:
            throw new ClientError('Ocurred something error.')
        }
      }

      const { behaviorAverageGroupedByPole } = result.value

      return {
        behaviorAverageGroupedByPole
      }
    })
}