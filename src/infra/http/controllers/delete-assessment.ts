import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { makeDeleteAssessmentUseCase } from "test/factories/make-delete-assessment-use-case.ts";
import { makeOnAssessmentDeleted } from "@/infra/factories/make-on-assessment-deleted.ts";

export async function deleteAssessment(
  app: FastifyInstance
) {
  app 
    .withTypeProvider<ZodTypeProvider>()
    .delete('/assessments/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, async (req, res) => {
      const { id } = req.params

      const { payload: { role, sub } } = req.user

      const ip = req.ip

      makeOnAssessmentDeleted()
      const useCase = makeDeleteAssessmentUseCase()
      const result = await useCase.execute({
        id,
        role,
        userId: sub,
        userIp: ip
      })

      if (result.isLeft()) {
        const error = result.value
        
        switch(error.constructor) {
          case NotAllowedError: 
            throw new NotAllowed('Invalid access level')
          case ResourceNotFoundError:
            throw new NotFound(error.message)
          default: 
            throw new ClientError('Ocurred something problem')
        }
      }

      return res.status(204).send()
    })
}

