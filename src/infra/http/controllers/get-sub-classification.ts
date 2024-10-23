import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { makeGetCourseClassificationUseCase } from "@/infra/factories/make-get-course-classification-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { InvalidCourseFormulaError } from "@/domain/boletim/app/use-cases/errors/invalid-course-formula-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { ClientError } from "../errors/client-error.ts";

import { dayjs } from '@/infra/libs/dayjs.ts'
import { makeGetCourseSubClassificationUseCase } from "@/infra/factories/make-get-course-sub-classification-use-case.ts";
import { ClassificationPresenter } from "../presenters/classification-presenter.ts";
import { StudentCourseDetailsPresenter } from "../presenters/student-course-details-presenter.ts";

export async function getSubClassification(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/classification/sub', {
      onRequest: [verifyJWT, verifyUserRole(['manager', 'admin', "dev"])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),

        querystring: z.object({
          page: z.string().optional(),
          hasBehavior: z.string().transform((item) => item === 'true'),
          disciplineModule: z.coerce.number()
        })
      }
    }, async (req, res) => {
      const { id } = req.params
      const { page, hasBehavior, disciplineModule } = req.query

      const useCase = makeGetCourseSubClassificationUseCase()
      const result = await useCase.execute({
        courseId: id,
        page: page ? Number(page) : undefined,
        hasBehavior,
        disciplineModule
      })
      
      if (result.isLeft()) {
        const error = result.value

        switch(error.constructor) {
          case ResourceNotFoundError: 
            throw new NotFound(error.message)
          case InvalidCourseFormulaError:
            throw new Conflict(error.message)
          default: 
            throw new ClientError()
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