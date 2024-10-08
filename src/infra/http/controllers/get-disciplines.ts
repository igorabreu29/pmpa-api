import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeFetchDisciplinesUseCase } from "@/infra/factories/make-fetch-disciplines-use-case.ts";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { DisciplinePresenter } from "../presenters/discipline-presenter.ts";

export async function getDisciplines(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/disciplines', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        querystring: z.object({
          page: z.string().optional()
        })
      }
    }, async (req, res) => {
      const { page } = req.query

      const useCase = makeFetchDisciplinesUseCase()
      const result = await useCase.execute({
        page: page ? Number(page) : undefined 
      })

      if (result.isLeft()) {
        throw new ClientError('Houve algum erro')
      }

      const { disciplines, pages, totalItems } = result.value

      return res.status(200).send({
        disciplines: disciplines.map(discipline => DisciplinePresenter.toHTTP(discipline)),
        pages,
        totalItems
      })
    })
} 