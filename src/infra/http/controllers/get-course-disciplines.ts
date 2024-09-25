import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { makeFetchCourseDisciplinesUseCase } from "@/infra/factories/make-fetch-course-disciplines.ts";
import { CourseWithDisciplinePresenter } from "../presenters/course-with-discipline-presenter.ts";

export async function getCourseDisciplines(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/disciplines', {
      onRequest: [verifyJWT],
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, 
      async (req, res) => {
        const { id } = req.params

        const useCase = makeFetchCourseDisciplinesUseCase()
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

        const { disciplines } = result.value

        const disciplinesPresenter = disciplines.map(discipline => CourseWithDisciplinePresenter.toHTTP(discipline))

        return res.status(200).send({
          disciplines: disciplinesPresenter,
        })
      }
    )
}