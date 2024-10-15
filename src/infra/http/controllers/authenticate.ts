import { InvalidCredentialsError } from "@/domain/boletim/app/use-cases/errors/invalid-credentials-error.ts";
import { makeAuthenticateUseCase } from "@/infra/factories/make-authenticate-use-case.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { env } from "@/infra/env/index.ts";
import { UnauthorizedError } from "../errors/unauthorized-error.ts";
import { CPF } from "@/domain/boletim/enterprise/entities/value-objects/cpf.ts";

export async function authenticate(
  app: FastifyInstance
) {
  app.withTypeProvider<ZodTypeProvider>().post('/credentials/auth', {
    schema: {
      body: z.object({
        cpf: z.string().length(14, 'O CPF deve conter 14 caracteres!').transform(input => {
          return CPF.format(input)
        }),
        password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres.').max(20, 'A senha deve conter no máximo 20 caracteres.')
      })
    }
  }, 
  async (req, res) => {
    const { cpf, password } = req.body

    const useCase = makeAuthenticateUseCase()
    const result = await useCase.execute({
      cpf,
      password
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case InvalidCredentialsError: 
          throw new UnauthorizedError('CPF ou Senha inválidos!')
        default: 
          throw new ClientError('Bad Request')
      }
    }

    const { token, redirect } = result.value

    if (redirect) {
      return res.send({
        token,
        redirect,
      })
    }

    return res.status(201).send({
      token
    })
  })
}