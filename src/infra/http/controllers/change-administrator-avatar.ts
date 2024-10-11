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
import { upload } from "@/infra/libs/multer.ts";
import { makeChangeAdministratorAvatarUseCase } from "@/infra/factories/make-change-administrator-avatar-use-case.ts";

export async function changeAdministratorAvatar(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/administrators/avatar', {
      onRequest: [verifyJWT, verifyUserRole(['admin'])],
      preHandler: upload.single('avatar'),
    }, 
  async (req, res) => {
    const { payload } = req.user

    const assessmentFileSchema = z.object({
      filename: z.string(),
    })

    const { filename } = assessmentFileSchema.parse(req.file)

    const fullUrl = req.protocol.concat('://').concat(req.host)
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

    const useCase = makeChangeAdministratorAvatarUseCase()
    const result = await useCase.execute({
      id: payload.sub,
      fileLink: fileUrl.href
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case NotAllowedError: 
          throw new NotAllowed('Nível de acesso inválido')
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
        default: 
          throw new ClientError('Houve algum problema')
      }
    }

    return res.status(204).send()
  })
}