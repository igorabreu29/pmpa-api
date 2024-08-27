import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { makeChangeStudentStatusUseCase } from "@/infra/factories/make-change-student-status-use-case.ts";

export async function changeStudentStatus(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/courses/:courseId/students/:id/status', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid(),
          id: z.string().uuid()
        }),
        body: z.object({
          status: z.boolean()
        })
      },
    }, 
  async (req, res) => {
    const { id, courseId } = req.params
    const { status } = req.body
    const { payload: { role } } = req.user

    const useCase = makeChangeStudentStatusUseCase()
    const result = await useCase.execute({
      id,
      status,
      role,
      courseId
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case NotAllowedError: 
          throw new NotAllowed('Invalid access level')
        case InvalidEmailError:
          throw new Conflict('This email is not valid.') 
        case InvalidPasswordError:
          throw new Conflict('This password is not valid.') 
        case InvalidBirthdayError:
          throw new Conflict('This birthday is not valid.') 
        case InvalidNameError:
          throw new Conflict('This name is not valid.') 
        case InvalidCPFError:
          throw new Conflict('This cpf is not valid.') 
        case InvalidBirthdayError:
          throw new Conflict('This date is not valid.') 
        default: 
          throw new ClientError('Ocurred something problem')
      }
    }

    return res.status(204).send()
  })
}