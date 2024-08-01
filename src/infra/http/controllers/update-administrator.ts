import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeUpdateStudentUseCase } from "@/infra/factories/make-update-student-use-case.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { ConflictError } from "../errors/conflict-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { makeUpdateAdministratorUseCase } from "@/infra/factories/make-update-administrator-use-case.ts";

export async function updateAdministrator(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/administrators/:id', {
      onRequest: [verifyJWT, verifyUserRole(['dev'])],
      schema: {
        params: z.object({
          id: z.string().cuid()
        }),
        body: z.object({
          username: z.string().min(3).max(50).optional(),
          email: z.string().email().optional(),
          cpf: z.string().min(14).max(14).optional(),
          password: z.string().min(6).max(20).optional(),
          birthday: z.string().transform(birthday => {
            const [day, month, year] = birthday.split('/')

            const date = new Date()
            date.setFullYear(Number(year), Number(month), Number(day))

            return date
          }).optional(),
          civilId: z.number().optional(),
        })
      },
    }, 
  async (req, res) => {
    const { id } = req.params
    const { username, email, cpf, password, birthday, civilId } = req.body
    const { payload: { sub, role } } = req.user

    const ip = req.ip

    const useCase = makeUpdateAdministratorUseCase()
    const result = await useCase.execute({
      id,
      username,
      email,
      cpf,
      password,
      birthday,
      civilId,
      role,
      userId: sub, 
      userIp: ip,
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case NotAllowedError: 
          throw new NotAllowed('Invalid access level')
        case InvalidEmailError:
          throw new ConflictError('This email is not valid.') 
        case InvalidPasswordError:
          throw new ConflictError('This password is not valid.') 
        case InvalidBirthdayError:
          throw new ConflictError('This birthday is not valid.') 
        case InvalidNameError:
          throw new ConflictError('This name is not valid.') 
        case InvalidCPFError:
          throw new ConflictError('This cpf is not valid.') 
        case InvalidBirthdayError:
          throw new ConflictError('This date is not valid.') 
        default: 
          throw new ClientError('Ocurred something problem')
      }
    }

    return res.status(204).send()
  })
}