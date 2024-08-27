import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { ClientError } from "../errors/client-error.ts";
import { makeCreateCoursePoleUseCase } from "@/infra/factories/make-create-course-pole-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";

export async function createCoursePole(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/pole', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid()
        }),
        body: z.object({
          poleId: z.string().uuid()
        })
      }
    },
      async (req, res) => {
        const { courseId } = req.params
        const { poleId } = req.body

        const useCase = makeCreateCoursePoleUseCase()
        const result = await useCase.execute({
          courseId,
          poleId
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceAlreadyExistError: 
              throw new Conflict(error.message)
            case ResourceNotFoundError: 
              throw new NotFound(error.message)
            default: 
              throw new ClientError('Ocurred something error')
          }
        }

        return res.status(201).send()
      }
    )
}