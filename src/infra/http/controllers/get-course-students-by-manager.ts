import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeFetchCourseStudentsUseCase } from "@/infra/factories/make-fetch-course-students-use-case.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeFetchCourseStudentsByPoleUseCase } from "@/infra/factories/make-fetch-course-students-by-pole-use-case.ts";
import { StudentWithPolePresenter } from "../presenters/student-with-pole-presenter.ts";
import { StudentCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-course-details.ts";
import { StudentCourseDetailsPresenter } from "../presenters/student-course-details-presenter.ts";
import { makeFetchCourseStudentsByManagerUseCase } from "@/infra/factories/make-fetch-course-students-by-manager-use-case.ts";

export async function getCourseStudentsByManager(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/poles/:poleId/manager/students', {
      onRequest: [verifyJWT, verifyUserRole(['manager'])],
      schema: {
        querystring: z.object({
          page: z.coerce.number().default(1),
          cpf: z.string().optional(),
          username: z.string().optional(),
          isEnabled: z.string().default('true')
        }),
        params: z.object({
          id: z.string().uuid(),
        })
      }
    }, 
      async (req, res) => {
        const { page, cpf, username, isEnabled } = req.query
        const { id } = req.params
        const { payload } = req.user

        const useCase = makeFetchCourseStudentsByManagerUseCase()
        const result = await useCase.execute({
          courseId: id,
          page,
          cpf, 
          managerId: payload.sub,
          username,
          isEnabled: isEnabled === 'true',
          perPage: 10,
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceNotFoundError: 
              throw new NotFound(error.message)
            default: 
              throw new ClientError('Ocurred something error')
          }
        }

        const { studentPoles, pages, totalItems } = result.value

        const studentsPresenter = studentPoles.map(student => StudentCourseDetailsPresenter.toHTTP(student))

        return res.status(200).send({
          students: studentsPresenter,
          pages,
          totalItems
        })
      }
    )
}