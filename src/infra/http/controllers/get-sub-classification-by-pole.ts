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

export async function getSubClassificationByPole(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/poles/:poleId/classification/sub', {
      onRequest: [verifyJWT, verifyUserRole(['manager', 'admin', "dev"])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
          poleId: z.string().uuid(),
        }),

        querystring: z.object({
          page: z.string().optional(),
          disciplineModule: z.coerce.number(),
          hasBehavior: z.string().transform((item) => item === 'true'),
        })
      }
    }, async (req, res) => {
      const { id, poleId } = req.params
      const { page, hasBehavior, disciplineModule } = req.query

      const useCase = makeGetCourseSubClassificationByPoleUseCase()
      const result = await useCase.execute({
        courseId: id,
        disciplineModule,
        page: page ? Number(page) : undefined,
        hasBehavior,
        poleId
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