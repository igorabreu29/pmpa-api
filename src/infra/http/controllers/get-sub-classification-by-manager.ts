import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { InvalidCourseFormulaError } from "@/domain/boletim/app/use-cases/errors/invalid-course-formula-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { ClientError } from "../errors/client-error.ts";

import { dayjs } from '@/infra/libs/dayjs.ts';
import { makeGetCourseSubClassificationByPoleUseCase } from "@/infra/factories/make-get-course-sub-classification-by-pole-use-case.ts";
import { ClassificationPresenter } from "../presenters/classification-presenter.ts";
import { StudentCourseDetailsPresenter } from "../presenters/student-course-details-presenter.ts";

export async function getSubClassificationByManager(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/manager/classification/sub', {
      onRequest: [verifyJWT, verifyUserRole(['manager', 'admin', "dev"])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),

        querystring: z.object({
          page: z.string().optional(),
          disciplineModule: z.coerce.number(),
          hasBehavior: z.string().transform((item) => item === 'true'),
        })
      }
    }, async (req, res) => {
      const { id } = req.params
      const { page, hasBehavior, disciplineModule } = req.query
      const { payload } = req.user

      const useCase = makeGetCourseSubClassificationByPoleUseCase()
      const result = await useCase.execute({
        courseId: id,
        disciplineModule,
        page: page ? Number(page) : undefined,
        hasBehavior,
        managerId: payload.sub
      })
      
      if (result.isLeft()) {
        const error = result.value

        switch(error.constructor) {
          case ResourceNotFoundError: 
            throw new NotFound(error.message)
          case InvalidCourseFormulaError:
            throw new Conflict(error.message)
          default: 
            throw new ClientError('Houve algum erro')
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