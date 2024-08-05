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
import { makeCreateCourseHistoricUseCase } from "@/infra/factories/make-create-course-historic-use-case.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { ConflictError } from "@/domain/boletim/app/use-cases/errors/conflict-error.ts";

export async function createCourseHistoric(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/historic', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          courseId: z.string().cuid()
        }),
        body: z.object({
          className: z.string(), 
          startDate: z.string().transform(transformDate), 
          finishDate: z.string().transform(transformDate), 
          speechs: z.number().optional(), 
          internships: z.number().optional(), 
          totalHours: z.number().optional(), 
          divisionBoss: z.string().optional(), 
          commander: z.string().optional(), 
        })
      }
    },
      async (req, res) => {
        const { courseId } = req.params
        const { className, startDate, finishDate, speechs, internships, totalHours, divisionBoss, commander } = req.body

        const useCase = makeCreateCourseHistoricUseCase()
        const result = await useCase.execute({
          courseId, 
          className,
          startDate,
          finishDate,
          speechs,
          internships,
          totalHours,
          divisionBoss,
          commander
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceAlreadyExistError: 
              throw new Conflict(error.message)
            case ResourceNotFoundError: 
              throw new NotFound(error.message)
            case ConflictError: 
              throw new Conflict(error.message)
            default: 
              throw new ClientError('Ocurred something error')
          }
        }

        return res.status(201).send()
      }
    )
}