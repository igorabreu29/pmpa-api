import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { makeFetchLoginConfirmationMetricsByManagerUseCase } from "@/infra/factories/make-fetch-login-cofirmation-metrics-by-manager-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";

export async function getLoginConfirmationMetricsByManager(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/courses/:id/manager/students/metrics', {
      onRequest: [verifyJWT, verifyUserRole(['manager'])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        })
      }
    }, 
    async (req, res) => {
      const { id } = req.params
      const { payload } = req.user

      const useCase = makeFetchLoginConfirmationMetricsByManagerUseCase()
      const result = await useCase.execute({
        courseId: id,
        managerId: payload.sub
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

      const { studentsMetricsByPole } = result.value

      return res.status(200).send({
        loginConfirmationMetrics: {
          ...studentsMetricsByPole,
          poleId: studentsMetricsByPole.poleId.toValue()
        }
      })
    }
  )
}