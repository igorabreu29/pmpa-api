import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { makeDeleteCourseDisciplineUseCase } from "@/infra/factories/make-delete-course-discipline-use-case.ts";

export async function deleteCourseDiscipline(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/courses/:courseId/disciplines/:disciplineId', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid(),
          disciplineId: z.string().uuid(),
        }),
      }
    },
      async (req, res) => {
        const { courseId, disciplineId } = req.params

        const useCase = makeDeleteCourseDisciplineUseCase()
        const result = await useCase.execute({
          courseId,
          disciplineId,
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceNotFoundError: 
              throw new NotFound(error.message)
            default: 
              throw new ClientError()
          }
        }

        return res.status(204).send()
      }
    )
}