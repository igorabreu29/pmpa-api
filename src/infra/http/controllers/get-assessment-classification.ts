import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { makeGetCourseAssessmentClassificationUseCase } from "@/infra/factories/make-get-course-assessment-classification-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";

export async function getAssessmentClassification(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/classification/assessments', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),

        querystring: z.object({
          page: z.string().optional(),
        })
      },
    }, async (req, res) => {
      const { id } = req.params
      const { page } = req.query

      const useCase = makeGetCourseAssessmentClassificationUseCase()
      const result = await useCase.execute({
        courseId: id,
        page: page ? Number(page) : undefined,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError: 
            throw new NotFound(error.message)
          default:
            throw new ClientError('Houve algum erro.')
        }
      }

      const { assessmentAverageGroupedByPole } = result.value

      return {
        assessmentAverageGroupedByPole
      }
    })
}