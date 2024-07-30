import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCreateStudentUseCase } from "@/infra/factories/make-create-student-use-case.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { ConflictError } from "../errors/conflict-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";

export async function createStudent(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/students', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        body: z.object({
          username: z.string().min(3).max(50),
          email: z.string().email(),
          cpf: z.string().min(14).max(14),
          birthday: z.string().transform(birthday => {
            const [day, month, year] = birthday.split('/')

            const date = new Date()
            date.setFullYear(Number(year), Number(month), Number(day))

            return date
          }),
          civilId: z.number(),
          courseId: z.string().cuid(),
          poleId: z.string().cuid()
        })
      },
    }, 
  async (req, res) => {
    const { username, email, cpf, birthday, civilId, courseId, poleId } = req.body
    const { payload: { sub, role } } = req.user

    const ip = req.ip

    const useCase = makeCreateStudentUseCase()
    const result = await useCase.execute({
      username,
      cpf,
      email,
      birthday,
      civilId,
      courseId,
      poleId,
      role,
      userId: sub, 
      userIp: ip
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
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
        case ResourceAlreadyExistError: 
          throw new ConflictError('Student already be present in the platform')
        default: 
          throw new ClientError('Ocurred something problem')
      }
    }

    return res.status(201).send()
  })
}