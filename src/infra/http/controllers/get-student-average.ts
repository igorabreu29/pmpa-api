import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { z } from "zod";
import { makeGetStudentAverageInTheCourseUseCase } from "@/infra/factories/make-get-student-average-in-the-course-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";

export async function getStudentAverage(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/students/:studentId/average', {
      onRequest: [verifyJWT],
      schema: {
        params: z.object({
          id: z.string().uuid(),
          studentId: z.string().uuid()
        }),
        querystring: z.object({
          type: z.enum(['module', 'period'])
        })
      }
    }, async (req, res) => {
      const { id, studentId } = req.params
      const { type } = req.query

      const useCase = makeGetStudentAverageInTheCourseUseCase()
      const result = await useCase.execute({
        courseId: id, 
        studentId,
        isPeriod: type === 'period' ? true : false
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
      
      const { behaviorMonths, grades } = result.value

      return res.status(200).send({
        grades,
        behaviorMonths
      })
    })
}