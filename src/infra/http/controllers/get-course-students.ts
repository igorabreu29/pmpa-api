import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeFetchCourseStudentsUseCase } from "@/infra/factories/make-fetch-course-students-use-case.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { StudentCourseDetailsPresenter } from "../presenters/student-course-details-presenter.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";

export async function getCourseStudents(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/students', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        querystring: z.object({
          page: z.string().optional(),
          cpf: z.string().optional(),
          username: z.string().optional(),
          isEnabled: z.string().optional()
        }),
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, 
      async (req, res) => {
        const { page, cpf, username, isEnabled } = req.query
        const { id } = req.params

        const useCase = makeFetchCourseStudentsUseCase()
        const result = await useCase.execute({
          courseId: id,
          page: page ? Number(page) : undefined,
          cpf,
          username,
          isEnabled: isEnabled ? isEnabled === 'true' : undefined,
          perPage: 10,
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

        const { students, pages, totalItems } = result.value

        const studentsPresenter = students.map(student => StudentCourseDetailsPresenter.toHTTP(student))

        return res.status(200).send({
          students: studentsPresenter,
          pages,
          totalItems
        })
      }
    )
}