import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeFetchCourseManagersUseCase } from "@/infra/factories/make-fetch-course-managers-use-case.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { ManagerCourseDetailsPresenter } from "../presenters/manager-course-details-presenter.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";

export async function getCourseManagers(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/managers', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        querystring: z.object({
          page: z.coerce.number().default(1),
          cpf: z.string().optional(),
          username: z.string().optional(),
          isEnabled: z.string().default('true')
        }),
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, 
      async (req, res) => {
        const { page, cpf, username, isEnabled } = req.query
        const { id } = req.params

        const useCase = makeFetchCourseManagersUseCase()
        const result = await useCase.execute({
          courseId: id,
          page,
          cpf,
          username,
          isEnabled: isEnabled === 'true' ? true : false,
          perPage: 10,
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

        const { managers, pages, totalItems } = result.value

        const managersPresenter = managers.map(manager => ManagerCourseDetailsPresenter.toHTTP(manager))

        return res.status(200).send({
          managers: managersPresenter,
          pages,
          totalItems
        })
      }
    )
}