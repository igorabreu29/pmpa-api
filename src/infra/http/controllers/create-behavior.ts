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
import { makeCreateBehaviorUseCase } from "@/infra/factories/make-create-behavior-use-case.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { makeOnBehaviorCreated } from "@/infra/factories/make-on-behavior-created.ts";

export async function createBehavior(
  app: FastifyInstance
) {
  app 
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/behavior', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid()
        }),
        body: z.object({
          studentId: z.string().uuid(),
          january: z.number().nullable().default(null),
          february: z.number().nullable().default(null),
          march: z.number().nullable().default(null),
          april: z.number().nullable().default(null),
          may: z.number().nullable().default(null),
          jun: z.number().nullable().default(null),
          july: z.number().nullable().default(null),
          august: z.number().nullable().default(null),
          september: z.number().nullable().default(null),
          october: z.number().nullable().default(null),
          november: z.number().nullable().default(null),
          december: z.number().nullable().default(null),
          module: z.number().optional(),
        })
      }
    }, async (req, res) => {
      const { courseId } = req.params
      const {
        studentId,
        january, 
        february,
        march,
        april,
        may, 
        jun,
        july,
        august, 
        september,
        october,
        november,
        december,
        module
      } = req.body

      const { payload: { role, sub } } = req.user

      const ip = req.ip

      makeOnBehaviorCreated()
      const useCase = makeCreateBehaviorUseCase()
      const result = await useCase.execute({
        courseId,
        studentId,
        january, 
        february,
        march,
        april,
        may, 
        jun,
        july,
        august, 
        september,
        october,
        november,
        december,
        module,
        role,
        userId: sub,
        userIp: ip
      })

      if (result.isLeft()) {
        const error = result.value
        
        switch(error.constructor) {
          case NotAllowedError: 
            throw new NotAllowed('Nível de acesso inválido')
          case ResourceNotFoundError:
            throw new NotFound(error.message)
          case ConflictError:
            throw new Conflict(error.message)
          case ResourceAlreadyExistError: 
            throw new Conflict(error.message)
          default: 
            throw new ClientError('Houve algum problema')
        }
      }

      return res.status(201).send()
    })
}

