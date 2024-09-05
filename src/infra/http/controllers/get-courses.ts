import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeFetchCoursesUseCase } from "@/infra/factories/make-fetch-courses-use-case.ts";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { CoursePresenter } from "../presenters/course-presenter.ts";

export async function getCourses(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        querystring: z.object({
          page: z.string().optional()
        })
      }
    }, async (req, res) => {
      const { page } = req.query

      const useCase = makeFetchCoursesUseCase()
      const result = await useCase.execute({ page: page ? Number(page) : undefined })

      if (result.isLeft()) {
        throw new ClientError('Ocurred something error')
      }

      const { courses, pages, totalItems } = result.value

      return res.status(200).send({
        courses: courses.map(course => CoursePresenter.toHTTP(course)),
        pages,
        totalItems
      })
    })
} 