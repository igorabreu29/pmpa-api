import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { z } from "zod";
import { makeGetCourseStudentUseCase } from "@/infra/factories/make-get-course-student-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { StudentCourseDetailsPresenter } from "../presenters/student-course-details-presenter.ts";

export async function getCourseStudent(
  app: FastifyInstance
) {
  app
  .withTypeProvider<ZodTypeProvider>()
  .get('/courses/:courseId/students/:id', {
    onRequest: [verifyJWT],
    schema: {
      params: z.object({
        courseId: z.string().uuid(),
        id: z.string().uuid()
      })
    }
  }, async (req, res) => {
    const { courseId, id } = req.params

    const useCase = makeGetCourseStudentUseCase()
    const result = await useCase.execute({
      courseId,
      id
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

    const { student } = result.value
    
    return res.send({
      student: StudentCourseDetailsPresenter.toHTTP(student)
    })
  })
}