import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeRestorePasswordUseCase } from "@/infra/factories/make-restore-password-use-case.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFound } from "../errors/not-found.ts";
import { ConflictError } from "@/domain/boletim/app/use-cases/errors/conflict-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ClientError } from "../errors/client-error.ts";

export async function restorePassword(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/restore', {
    schema: {
      body: z.object({
        newPassword: z.string().min(6, 'The passwod must be bigger than 6 characters').max(14, 'The password must be lower than 14 characters'),
        confirmPassword: z.string().min(6, 'The passwod must be bigger than 6 characters').max(14, 'The password must be lower than 14 characters'),
      }),

      querystring: z.object({
        email: z.string().email()
      })
    },
  }, async (req, res) => {
    const { email } = req.query
    const { newPassword, confirmPassword } = req.body
    
    const useCase = makeRestorePasswordUseCase()
    const result = await useCase.execute({
      email,
      newPassword,
      confirmPassword
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case ConflictError:
          throw new Conflict(error.message)
        case InvalidPasswordError:
          throw new Conflict(error.message)
        default:
          throw new ClientError()
      }
    }

    return res.status(204).send()
  })
}