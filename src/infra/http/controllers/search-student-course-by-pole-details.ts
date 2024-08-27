import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { StudentCourseDetailsPresenter } from "../presenters/student-course-details-presenter.ts";
import { makeSearchStudentCourseByPoleDetailsUseCase } from "@/infra/factories/make-search-student-course-by-pole-details.ts";

export async function searchStudentCourseByPoleDetails(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/poles/:poleId/students/search', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
          poleId: z.string().uuid(),
        }),
        
        querystring: z.object({
          query: z.string(),
          page: z.coerce.number().default(1),
        })
      }
    }, async (req, res) => {
      const { id, poleId } = req.params
      const { query, page } = req.query

      const useCase = makeSearchStudentCourseByPoleDetailsUseCase()
      const result = await useCase.execute({
        courseId: id,
        poleId,
        page,
        query
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

      return res.status(200).send({
        students: students.map(student => StudentCourseDetailsPresenter.toHTTP(student)),
        pages,
        totalItems
      })
    })
}