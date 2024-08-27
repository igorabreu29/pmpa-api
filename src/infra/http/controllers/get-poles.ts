import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeFetchPolesUseCase } from "@/infra/factories/make-fetch-poles-use-case.ts";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { PolePresenter } from "../presenters/pole-presenter.ts";

export async function getPoles(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/poles', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
    }, async (req, res) => {
      const useCase = makeFetchPolesUseCase()
      const result = await useCase.execute()

      if (result.isLeft()) {
        throw new ClientError('Ocurred something error')
      }

      const { poles } = result.value

      return res.status(200).send({
        poles: poles.map(pole => PolePresenter.toHTTP(pole)),
      })
    })
} 