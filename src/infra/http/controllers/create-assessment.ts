import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { makeCreateAssessmentUseCase } from "@/infra/factories/make-create-assessment-use-case.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { ClientError } from "../errors/client-error.ts";
import { ConflictError } from "@/domain/boletim/app/use-cases/errors/conflict-error.ts";
import { makeOnAssessmentCreated } from "@/infra/factories/make-on-assessment-created.ts";

export async function createAssessment(
  app: FastifyInstance
) {
  app 
    .withTypeProvider<ZodTypeProvider>()
    .post('/disciplines/:disciplineId/assessment', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          disciplineId: z.string().cuid()
        }),
        body: z.object({
          courseId: z.string().cuid(),
          studentId: z.string().cuid(),
          vf: z.number().min(0),
          avi: z.number().optional(),
          avii: z.number().optional(),
          vfe: z.number().optional(),
        })
      }
    }, async (req, res) => {
      const { disciplineId } = req.params
      const { courseId, studentId, vf, avi, avii, vfe } = req.body

      const { payload: { role, sub } } = req.user

      const ip = req.ip

      makeOnAssessmentCreated()
      const useCase = makeCreateAssessmentUseCase()
      const result = await useCase.execute({
        courseId,
        disciplineId,
        studentId,
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
          case ResourceAlreadyExistError:
            throw new Conflict(error.message)
          case ConflictError:
            throw new Conflict(error.message)
          default: 
            throw new ClientError('Ocurred something problem')
        }
      }

      return res.status(201).send()
    })
}

