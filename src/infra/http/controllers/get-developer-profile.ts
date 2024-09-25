import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { makeGetDeveloperProfileUseCase } from "@/infra/factories/make-get-developer-profile-use-case.ts";
import { DeveloperPresenter } from "../presenters/developer-presenter.ts";

export async function getDeveloperProfile(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/developers/profile', {
      onRequest: [verifyJWT],
    }, 
    async (req, res) => {
      const { payload } = req.user
      
      const useCase = makeGetDeveloperProfileUseCase()
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

      const { developer } = result.value

      const developerPresenter = DeveloperPresenter.toHTTP(developer)

      return res.status(200).send({
        developer: developerPresenter
      })
  })
}