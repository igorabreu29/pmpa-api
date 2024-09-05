import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { z } from "zod";
import { makeGetCourseManagerUseCase } from "@/infra/factories/make-get-course-manager-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { ManagerCourseDetailsPresenter } from "../presenters/manager-course-details-presenter.ts";

export async function getCourseManager(
  app: FastifyInstance
) {
  app
  .withTypeProvider<ZodTypeProvider>()
  .get('/courses/:courseId/managers/:id', {
    onRequest: [verifyJWT],
    schema: {
      params: z.object({
        courseId: z.string().uuid(),
        id: z.string().uuid()
      })
    }
  }, async (req, res) => {
    const { courseId, id } = req.params

    const useCase = makeGetCourseManagerUseCase()
    const result = await useCase.execute({
      courseId,
      id
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

    const { manager } = result.value
    
    return res.send({
      manager: ManagerCourseDetailsPresenter.toHTTP(manager)
    })
  })
}