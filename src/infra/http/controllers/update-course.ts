import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { makeUpdateCourseUseCase } from "@/infra/factories/make-update-course-use-case.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { ClientError } from "../errors/client-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { InvalidDateError } from "@/core/errors/domain/invalid-date.ts";

export async function updateCourse(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/courses/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),

        body: z.object({
          formula: z.enum(['CGS', 'CFP', 'CAS', 'CFO', 'CHO']),
          name: z.string().optional(),
          startAt: z.string().transform(transformDate).optional(),
          endsAt: z.string().transform(transformDate).optional(),
        })
      }
    },
      async (req, res) => {
        const { id } = req.params
        const { formula, name, startAt, endsAt } = req.body

        const useCase = makeUpdateCourseUseCase()
        const result = await useCase.execute({
          id,
          formula,
          name,
          startAt,
          endsAt
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceNotFoundError: 
              throw new NotFound(error.message)
            case InvalidNameError:  
              throw new Conflict(error.message)
            case InvalidDateError:  
              throw new Conflict(error.message)
            default: 
              throw new ClientError()
          }
        }

        return res.status(204).send()
      }
    )
}