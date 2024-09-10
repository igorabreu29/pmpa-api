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
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { makeUpdateBehaviorUseCase } from "@/infra/factories/make-update-behavior-use-case.ts";
import { makeOnBehaviorUpdated } from "@/infra/factories/make-on-behavior-updated.ts";

export async function updateBehavior(
  app: FastifyInstance
) {
  app 
    .withTypeProvider<ZodTypeProvider>()
    .put('/behaviors/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),
        body: z.object({
          january: z.number().optional(),
          february: z.number().optional(),
          march: z.number().optional(),
          april: z.number().optional(),
          may: z.number().optional(),
          jun: z.number().optional(),
          july: z.number().optional(),
          august: z.number().optional(),
          september: z.number().optional(),
          october: z.number().optional(),
          november: z.number().optional(),
          december: z.number().optional(),
        })
      }
    }, async (req, res) => {
      const { id } = req.params
      const {
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
      } = req.body

      const { payload: { role, sub } } = req.user

      const ip = req.ip

      makeOnBehaviorUpdated()
      const useCase = makeUpdateBehaviorUseCase()
      const result = await useCase.execute({
        id,
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
        role,
        userId: sub,
        userIp: ip,
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
          case ResourceAlreadyExistError: 
            throw new Conflict(error.message)
          default: 
            throw new ClientError('Ocurred something problem')
        }
      }

      return res.status(204).send()
    })
}

