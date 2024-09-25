import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { makeFetchCoursePolesUseCase } from "@/infra/factories/make-fetch-course-poles-use-case.ts";
import { PolePresenter } from "../presenters/pole-presenter.ts";

export async function getCoursePoles(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/poles', {
      onRequest: [verifyJWT],
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, 
      async (req, res) => {
        const { id } = req.params

        const useCase = makeFetchCoursePolesUseCase()
        const result = await useCase.execute({
          courseId: id,
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

        const { poles } = result.value

        const polesPresenter = poles.map(pole => PolePresenter.toHTTP(pole))

        return res.status(200).send({
          poles: polesPresenter,
        })
      }
    )
}