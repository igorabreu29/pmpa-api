import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { ClientError } from "../errors/client-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { makeCreateCourseDisciplineUseCase } from "@/infra/factories/make-create-course-discipline-use-case.ts";

export async function createCourseDiscipline(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/disciplines', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid()
        }),
        body: z.object({
          disciplineId: z.string().uuid(),
          expected: z.string(),
          hours: z.number(),
          module: z.number()
        })
      }
    },
      async (req, res) => {
        const { courseId } = req.params
        const { disciplineId, expected, hours, module } = req.body

        const useCase = makeCreateCourseDisciplineUseCase()
        const result = await useCase.execute({
          courseId,
          disciplineId,
          expected,
          hours, 
          module
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