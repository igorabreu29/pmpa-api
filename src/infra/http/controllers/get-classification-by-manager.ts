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
import { makeGetCourseClassificationByPoleUseCase } from "@/infra/factories/make-get-course-classification-by-pole-use-case.ts";7

import { dayjs } from '@/infra/libs/dayjs.ts'

export async function getClassificationByManager(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/manager/classification', {
      onRequest: [verifyJWT, verifyUserRole(['manager'])],
      schema: {
        params: z.object({
          id: z.string().cuid(),
        }),

        querystring: z.object({
          page: z.coerce.number().default(1),
          hasBehavior: z.boolean().default(true),
        })
      }
    }, async (req, res) => {
      const { id } = req.params
      const { page, hasBehavior } = req.query
      const { payload } = req.user

      const useCase = makeGetCourseClassificationByPoleUseCase()
      const result = await useCase.execute({
        courseId: id,
        page,
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
            throw new ClientError('Ocurred something wrong')
        }
      }

      const { studentsWithAverage } = result.value

      return res.status(200).send({
        studentsWithAverage: studentsWithAverage.map(student => ({
          ...student,
          studentBirthday: dayjs(student.studentBirthday).format('DD/MM/YYYY')
        }))
      })
    })
}