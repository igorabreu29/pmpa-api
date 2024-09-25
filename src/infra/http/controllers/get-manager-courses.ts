import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { z } from "zod";
import { makeFetchManagerCoursesUseCase } from "@/infra/factories/make-fetch-manager-courses-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { ManagerWithCoursePresenter } from "../presenters/manager-with-course-presenter.ts";

export async function getManagerCourses(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/managers/courses', {
      onRequest: [verifyJWT],
      schema: {
        querystring: z.object({
          page: z.coerce.number().default(1),
        }),
      }
    }, 
      async (req, res) => {
        const { page } = req.query
        const { payload } = req.user

        const useCase = makeFetchManagerCoursesUseCase()
        const result = await useCase.execute({
          page,
          perPage: 10,
          managerId: payload.sub
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

        const coursesPresenter = courses.map(course => ManagerWithCoursePresenter.toHTTP(course))

        return res.status(200).send({
          courses: coursesPresenter,
          pages,
          totalItems
        })
      }
    )
}