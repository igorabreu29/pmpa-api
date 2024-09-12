import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { makeCreateCourseUseCase } from "@/infra/factories/make-create-course-use-case.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidDateError } from "@/core/errors/domain/invalid-date.ts";
import { ClientError } from "../errors/client-error.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";

export async function createCourse(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        body: z.object({
          formula: z.enum(['CGS', 'CFP', 'CAS', 'CFO', 'CHO']),
          name: z.string().min(3).max(30),
          imageUrl: z.string().url(),
          isPeriod: z.boolean().default(false),
          endsAt: z.string().transform(transformDate),
          poleIds: z.array(z.string()),
          disciplines: z.array(
            z.object({
              id: z.string().uuid(),
              expected: z.string(),
              hours: z.number(),
              module: z.number(),
            })
          )
        })
      }
    },
      async (req, res) => {
        const { formula, name, imageUrl, isPeriod, poleIds, disciplines, endsAt } = req.body

        const useCase = makeCreateCourseUseCase()
        const result = await useCase.execute({
          formula,
          name,
          imageUrl,
          isPeriod,
          poleIds,
          disciplines,
          endsAt,
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceAlreadyExistError: 
              throw new Conflict(error.message)
            case InvalidNameError:  
              throw new Conflict(error.message)
            case InvalidDateError:
              throw new Conflict(error.message)
            default: 
              throw new ClientError('Ocurred something error')
          }
        }

        return res.status(201).send()
      }
    )
}