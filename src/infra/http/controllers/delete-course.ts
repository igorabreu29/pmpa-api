import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { makeDeleteCourseUseCase } from "@/infra/factories/make-delete-course-use-case.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { ClientError } from "../errors/client-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

export async function deleteCourse(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/courses/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),
      }
    },
      async (req, res) => {
        const { id } = req.params

        const useCase = makeDeleteCourseUseCase()
        const result = await useCase.execute({
          id,
        })

        if (result.isLeft()) {
          const error = result.value

          switch(error.constructor) {
            case ResourceNotFoundError: 
              throw new Conflict(error.message)
            case InvalidNameError:  
              throw new Conflict(error.message)
            default: 
              throw new ClientError()
          }
        }

        return res.status(204).send()
      }
    )
}