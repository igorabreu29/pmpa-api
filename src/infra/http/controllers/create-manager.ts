import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { makeCreateManagerUseCase } from "@/infra/factories/make-create-manager-use-case.ts";
import { makeOnManagerCreated } from "@/infra/factories/make-on-manager-created.ts";

export async function createManager(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/managers', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        body: z.object({
          username: z.string().min(3, 'O nome deve conter no minímo 3 caracteres.').max(50, 'O nome deve conter no máximo 50 caracteres'),
          email: z.string().email('E-mail inválido!'),
          cpf: z.string().length(14, 'O CPF deve ter 14 caracteres.'),
          birthday: z.string().transform(transformDate),
          civilId: z.string(),
          courseId: z.string().uuid(),
          poleId: z.string().uuid()
        })
      },
    }, 
  async (req, res) => {
    const { username, email, cpf, birthday, civilId, courseId, poleId } = req.body
    const { payload: { sub, role } } = req.user

    const ip = req.ip

    makeOnManagerCreated()
    const useCase = makeCreateManagerUseCase()
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
          throw new Conflict('Email inválido!') 
        case InvalidPasswordError:
          throw new Conflict('Senha inválida!') 
        case InvalidBirthdayError:
          throw new Conflict('Data de nascimento inválida!') 
        case InvalidNameError:
          throw new Conflict('Nome inválido!') 
        case InvalidCPFError:
          throw new Conflict('CPF inválido!') 
        case InvalidBirthdayError:
          throw new Conflict('This date is not valid.') 
        case ResourceAlreadyExistError: 
          throw new Conflict('Estudante já presente na plataforma')
        default: 
          throw new ClientError('Houve algum problema')
      }
    }

    return res.status(201).send()
  })
}