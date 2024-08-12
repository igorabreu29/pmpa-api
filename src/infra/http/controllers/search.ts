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
import { makeSearchUseCase } from "@/infra/factories/make-search-use-case.ts";

export async function search(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/users/search', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        querystring: z.object({
          query: z.string(),
          page: z.coerce.number().default(1),
        })
      }
    }, async (req, res) => {
      const { query, page } = req.query
      const { payload } = req.user

      const useCase = makeSearchUseCase()
      const result = await useCase.execute({
        page,
        query,
        role: payload.role,
      })

      if (result.isLeft()) {
        throw new ClientError('Ocurred something error')
      }

      const { searchs, pages, totalItems } = result.value

      return res.status(200).send({
        searchs: searchs.map(search => SearchPresenter.toHTTP(search)),
        pages,
        totalItems
      })
    })
}