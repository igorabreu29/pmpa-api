import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { makeFetchCourseBehaviorsUseCase } from "@/infra/factories/make-fetch-course-behaviors-use-case.ts";
import { BehaviorPresenter } from "../presenters/behavior-presenter.ts";

export async function getCourseBehaviors(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/behaviors', {
      onRequest: [verifyJWT],
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, 
      async (req, res) => {
        const { id } = req.params

        const useCase = makeFetchCourseBehaviorsUseCase()
        const result = await useCase.execute({
          courseId: id, 
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

        const { behaviors } = result.value

        const behaviorsPresenter = behaviors.map(behavior => BehaviorPresenter.toHTTP(behavior))

        return res.status(200).send({
          behaviors: behaviorsPresenter,
        })
      }
    )
}