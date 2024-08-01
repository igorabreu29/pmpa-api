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
import { ConflictError } from "../errors/conflict-error.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { makeCreateDeveloperUseCase } from "@/infra/factories/make-create-developer-use-case.ts";

export async function createDeveloper(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/developers', {
      onRequest: [verifyJWT, verifyUserRole(['dev'])],
      schema: {
        body: z.object({
          username: z.string().min(3).max(50),
          email: z.string().email(),
          cpf: z.string().min(14).max(14),
          password: z.string().min(6).max(20),
          birthday: z.string().transform(transformDate),
          civilId: z.number(),
        })
      },
    }, 
  async (req, res) => {
    const { username, email, cpf, birthday, civilId, password } = req.body
    const { payload: { sub, role } } = req.user

    const useCase = makeCreateDeveloperUseCase()
    const result = await useCase.execute({
      username,
      cpf,
      email,
      birthday,
      civilId,
      role,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
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