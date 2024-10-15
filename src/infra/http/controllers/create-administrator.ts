import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { makeCreateAdministratorUseCase } from "@/infra/factories/make-create-administrator-use-case.ts";
import { makeOnAdministratorCreated } from "@/infra/factories/make-on-administrator-created.ts";

export async function createAdministrator(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/administrators', {
      onRequest: [verifyJWT, verifyUserRole(['dev'])],
      schema: {
        body: z.object({
          username: z.string().min(3, 'O nome deve conter no minímo 3 caracteres.').max(50, 'O nome deve conter no máximo 50 caracteres'),
          email: z.string().email('E-mail inválido!'),
          cpf: z.string().length(14, 'O CPF deve ter 14 caracteres.'),
          password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres.').max(20, 'A senha deve conter no máximo 20 caracteres.'),
          birthday: z.string().transform(transformDate),
          civilId: z.string(),
        })
      },
    }, 
  async (req, res) => {
    const { username, email, cpf, birthday, civilId, password } = req.body
    const { payload: { sub, role } } = req.user

    const ip = req.ip

    makeOnAdministratorCreated()
    const useCase = makeCreateAdministratorUseCase()
    const result = await useCase.execute({
      username,
      cpf,
      email,
      birthday,
      civilId,
      role,
      password,
      userId: sub, 
      userIp: ip
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
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
        case ResourceAlreadyExistError: 
          throw new Conflict('Estudante já presente na plataforma')
        default: 
          throw new ClientError('Houve algum problema')
      }
    }

    return res.status(201).send()
  })
}