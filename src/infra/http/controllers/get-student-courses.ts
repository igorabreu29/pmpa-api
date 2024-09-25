import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { z } from "zod";
import { makeFetchStudentCoursesUseCase } from "@/infra/factories/make-fetch-student-courses-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { StudentWithCoursePresenter } from "../presenters/student-with-course-presenter.ts";

export async function getStudentCourses(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/students/courses', {
      onRequest: [verifyJWT],
      schema: {
        querystring: z.object({
          page: z.string().optional(),
        }),
      }
    }, 
      async (req, res) => {
        const { page } = req.query
        const { payload } = req.user

        const useCase = makeFetchStudentCoursesUseCase()
        const result = await useCase.execute({
          page: page ? Number(page) : undefined,
          perPage: 10,
          studentId: payload.sub
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

        const { courses, pages, totalItems } = result.value

        const coursesPresenter = courses.map(course => StudentWithCoursePresenter.toHTTP(course))

        return res.status(200).send({
          courses: coursesPresenter,
          pages,
          totalItems
        })
      }
    )
}