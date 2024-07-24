import { InvalidCredentialsError } from "@/domain/boletim/app/use-cases/errors/invalid-credentials-error.ts";
import { makeAuthenticateUseCase } from "@/infra/factories/make-authenticate-use-case.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { ConflictError } from "../errors/conflict-error.ts";
import { env } from "@/infra/env/index.ts";
import { makeCreateStudentUseCase } from "@/infra/factories/make-create-student-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";

export async function createStudent(
  app: FastifyInstance
) {
  app.withTypeProvider<ZodTypeProvider>().post('/students', {
    schema: {
      body: z.object({
        username: z.string().min(3).max(50),
        email: z.string().email(),
        cpf: z.string().min(14).max(14),
        birthday: z.coerce.date(),
        civilId: z.number(),
        courseId: z.string().cuid(),
        poleId: z.string().cuid()
      })
    }
  }, 
  async (req, res) => {
    const { username, email, cpf, birthday, civilId, courseId, poleId } = req.body

    const useCase = makeCreateStudentUseCase()
    const result = await useCase.execute({
      username,
      cpf,
      email,
      birthday,
      civilID: civilId,
      courseId,
      poleId
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
        case ResourceAlreadyExistError: 
          throw new ResourceAlreadyExistError(error.message)
        default: 
          throw new ClientError('Bad Request')
      }
    }

    return res.status(201).send()
  })
}