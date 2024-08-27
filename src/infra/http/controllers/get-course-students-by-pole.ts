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

export async function getCourseStudentsByPole(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/poles/:poleId/students', {
      onRequest: [verifyJWT, verifyUserRole(['manager', 'admin', 'dev'])],
      schema: {
        querystring: z.object({
          page: z.coerce.number().default(1),
          cpf: z.string().optional(),
          username: z.string().optional(),
          isEnabled: z.string().default('true')
        }),
        params: z.object({
          id: z.string().cuid(),
          poleId: z.string().cuid()
        })
      }
    }, 
      async (req, res) => {
        const { page, cpf, username, isEnabled } = req.query
        const { id, poleId } = req.params

        const useCase = makeFetchCourseStudentsByPoleUseCase()
        const result = await useCase.execute({
          courseId: id,
          page,
          cpf, 
          username,
          isEnabled: isEnabled === 'true',
          perPage: 10,
          poleId
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

        const { students, pages, totalItems } = result.value

        const studentsPresenter = students.studentsPole.map(student => StudentWithPolePresenter.toHTTP(student))

        return res.status(200).send({
          course: students.course.value,
          courseId: students.courseId.toValue(),
          students: studentsPresenter,
          pages,
          totalItems
        })
      }
    )
}