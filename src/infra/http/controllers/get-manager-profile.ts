import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { ManagerDetailsPresenter } from "../presenters/manager-details-presenter.ts";
import { makeGetManagerProfileUseCase } from "@/infra/factories/make-get-manager-profile-use-case.ts";

export async function getManagerProfile(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/managers/profile', {
      onRequest: [verifyJWT],
    }, 
    async (req, res) => {
      const { payload } = req.user
      
      const useCase = makeGetManagerProfileUseCase()
      const result = await useCase.execute({
        id: payload.sub
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

      const { manager } = result.value

      const managerDetailsPresenter = ManagerDetailsPresenter.toHTTP(manager)

      return res.status(200).send({
        manager: managerDetailsPresenter
      })
  })
}