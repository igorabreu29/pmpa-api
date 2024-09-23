import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { makeFetchAdministratorsUseCase } from "@/infra/factories/make-fetch-administrators-use-case.ts";
import { AdministratorPresenter } from "../presenters/administrator-present.ts";

export async function getAdministrators(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/administrators', {
      onRequest: [verifyJWT, verifyUserRole(['dev'])],
      schema: {
        querystring: z.object({
          cpf: z.string().optional(),
          username: z.string().optional(),
          page: z.coerce.number().default(1),
          isEnabled: z.string().transform(item => item === 'true')
        })
      }
    }, async (req, res) => {
      const { cpf, username, page, isEnabled } = req.query

      const useCase = makeFetchAdministratorsUseCase()
      const result = await useCase.execute({
        cpf,
        username,
        page,
        isEnabled
      })

      if (result.isLeft()) {
        throw new ClientError('Ocurred something error')
      }

      const { administrators, pages, totalItems } = result.value

      return res.status(200).send({
        administrators: administrators.map(AdministratorPresenter.toHTTP),
        pages,
        totalItems
      })
    })
} 