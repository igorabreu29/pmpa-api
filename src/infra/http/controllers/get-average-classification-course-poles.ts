import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { makeFetchCourseBehaviorsUseCase } from "@/infra/factories/make-fetch-course-behaviors-use-case.ts";
import { BehaviorPresenter } from "../presenters/behavior-presenter.ts";
import { makeGetAverageClassificationCoursePolesUseCase } from "@/infra/factories/make-get-average-classification-course-poles-use-case.ts";
import { InvalidCourseFormulaError } from "@/domain/boletim/app/use-cases/errors/invalid-course-formula-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";

export async function getAverageClassificationCoursePoles(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/classification/average', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, 
      async (req, res) => {
        const { id } = req.params

        const useCase = makeGetAverageClassificationCoursePolesUseCase()
        const result = await useCase.execute({
          courseId: id, 
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceNotFoundError: 
              throw new NotFound(error.message)
            case InvalidCourseFormulaError: 
              throw new Conflict(error.message)
            default: 
              throw new ClientError('Houve algum erro')
          }
        }

        const { studentsAverageGroupedByPole } = result.value

        return res.send({
          studentsAverageGroupedByPole,
        })
      }
    )
}