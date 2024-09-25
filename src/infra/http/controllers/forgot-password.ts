import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { CPF } from "@/domain/boletim/enterprise/entities/value-objects/cpf.ts";
import { makeForgotPasswordUseCase } from "@/infra/factories/make-forgot-password-use-case.ts";

export async function forgotPassword(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/forgot', {
    schema: {
      body: z.object({
        cpf: z.string().min(14, 'CPF inválido!').transform(CPF.format)
      }),
    },
  }, async (req, res) => {
    const { cpf } = req.body
    
    const useCase = makeForgotPasswordUseCase()
    const result = await useCase.execute({
      cpf
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

    const { message } = result.value

    return res.send({ message })
  })
}