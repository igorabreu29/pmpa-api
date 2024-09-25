import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { makeSearchStudentDetailsByManagerUseCase } from "@/infra/factories/make-search-students-details-by-manager.ts";
import { SearchPresenter } from "../presenters/search-presenter.ts";

export async function searchStudentsCourseByManagerDetails(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/manager/students/search', {
      onRequest: [verifyJWT, verifyUserRole(['manager'])],
      schema: {
        querystring: z.object({
          query: z.string(),
          page: z.coerce.number().default(1),
        })
      }
    }, async (req, res) => {
      const { query, page } = req.query
      const { payload } = req.user

      const useCase = makeSearchStudentDetailsByManagerUseCase()
      const result = await useCase.execute({
        page,
        query,
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

      const { students, pages, totalItems } = result.value

      return res.status(200).send({
        searchs: students.map(student => SearchPresenter.toHTTP(student)),
        pages,
        totalItems
      })
    })
}