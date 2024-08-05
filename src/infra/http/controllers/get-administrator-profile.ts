import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { AdministratorPresenter } from "../presenters/administrator-present.ts";
import { makeGetAdministratorProfileUseCase } from "@/infra/factories/make-get-administrator-profile-use-case.ts";

export async function getAdministratorProfile(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/administrators/profile', {
      onRequest: [verifyJWT],
    }, 
    async (req, res) => {
      const { payload } = req.user
      
      const useCase = makeGetAdministratorProfileUseCase()
      const result = await useCase.execute({
        id: payload.sub
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

      const { administrator } = result.value

      const administratorPresenter = AdministratorPresenter.toHTTP(administrator)

      return res.status(200).send({
        administrator: administratorPresenter
      })
  })
}