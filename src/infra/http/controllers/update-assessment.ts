import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { ClientError } from "../errors/client-error.ts";
import { ConflictError } from "@/domain/boletim/app/use-cases/errors/conflict-error.ts";
import { makeUpdateAssessmentUseCase } from "@/infra/factories/make-update-assessment-use-case.ts";
import { makeOnAssessmentUpdated } from "@/infra/factories/make-on-assessment-updated.ts";

export async function updateAssessment(
  app: FastifyInstance
) {
  app 
    .withTypeProvider<ZodTypeProvider>()
    .put('/disciplines/:disciplineId/assessment', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          disciplineId: z.string().uuid()
        }),
        body: z.object({
          courseId: z.string().uuid(),
          studentId: z.string().uuid(),
          vf: z.number().optional(),
          avi: z.number().optional(),
          avii: z.number().optional(),
          vfe: z.number().optional(),
        })
      }
    }, async (req, res) => {
      const { disciplineId } = req.params
      const { vf, avi, avii, vfe, courseId, studentId } = req.body

      const { payload: { role, sub } } = req.user

      const ip = req.ip

      makeOnAssessmentUpdated()
      const useCase = makeUpdateAssessmentUseCase()
      const result = await useCase.execute({
        studentId,
        courseId,
        disciplineId,
        vf,
        avi,
        avii,
        vfe,
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
          case ConflictError:
            throw new Conflict(error.message)
          default: 
            throw new ClientError('Ocurred something problem')
        }
      }

      return res.status(204).send()
    })
}

