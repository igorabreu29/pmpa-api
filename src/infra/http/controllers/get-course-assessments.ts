import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { makeFetchCourseAssessmentsUseCase } from "@/infra/factories/make-fetch-course-assessments-use-case.ts";
import { AssessmentPresenter } from "../presenters/assessment-presenter.ts";

export async function getCourseAssessments(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:courseId/disciplines/:disciplineId/assessments', {
      onRequest: [verifyJWT],
      schema: {
        params: z.object({
          courseId: z.string().uuid(),
          disciplineId: z.string().uuid()
        })
      }
    }, 
      async (req, res) => {
        const { courseId, disciplineId } = req.params

        const useCase = makeFetchCourseAssessmentsUseCase()
        const result = await useCase.execute({
          courseId,
          disciplineId, 
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceNotFoundError: 
              throw new NotFound(error.message)
            default: 
              throw new ClientError('Houve algum erro')
          }
        }

        const { assessments } = result.value

        const assessmentsPresenter = assessments.map(assessment => AssessmentPresenter.toHTTP(assessment))

        return res.status(200).send({
          assessments: assessmentsPresenter,
        })
      }
    )
}