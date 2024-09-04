import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeFetchCoursesUseCase } from "@/infra/factories/make-fetch-courses-use-case.ts";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { CoursePresenter } from "../presenters/course-presenter.ts";
import { makeGetCourseUseCase } from "@/infra/factories/make-get-course-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";

export async function getCourse(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, async (req, res) => {
      const { id } = req.params

      const useCase = makeGetCourseUseCase()
      const result = await useCase.execute({ id })

      if (result.isLeft()) {
        const error = result.value
        
        switch(error.constructor) {
          case ResourceNotFoundError: 
            throw new NotFound(error.message)
          default: 
            throw new ClientError()
        }
      }

      const { course } = result.value

      return res.send({
        course: CoursePresenter.toHTTP(course)
      })
    })
} 