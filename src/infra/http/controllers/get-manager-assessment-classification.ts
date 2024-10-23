import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { ClassificationPresenter } from "../presenters/classification-presenter.ts";
import { StudentCourseDetailsPresenter } from "../presenters/student-course-details-presenter.ts";
import { makeGetManagerAssessmentClassificationUseCase } from "@/infra/factories/make-get-manager-assessment-classification-use-case.ts";

export async function getAssessmentClassification(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/manager/classification/assessments', {
      onRequest: [verifyJWT, verifyUserRole(['manager'])],
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
      const { payload } = req.user

      const useCase = makeGetManagerAssessmentClassificationUseCase()
      const result = await useCase.execute({
        courseId: id,
        managerId: payload.sub,
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

      const { classifications, students, pages, totalItems } = result.value

      return res.status(200).send({
        classifications: classifications.map(ClassificationPresenter.toHTTP),
        students: students.map(StudentCourseDetailsPresenter.toHTTP),
        pages,
        totalItems
      })
    })
}