import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeCreateStudentsBatchUseCase } from "@/infra/factories/make-create-students-batch-use-case.ts";

import { upload } from "@/infra/libs/multer.ts";
import { z } from "zod";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { createStudentsBatchExcelToJSON } from "@/infra/utils/excel-to-json.ts";
import { makeOnStudentBatchCreated } from "@/infra/factories/make-on-student-batch-created.ts";

export async function createStudentBatch(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:id/students/batch', {
      preHandler: upload.single('excel'),
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      }
    }, 
  async (req, res) => {
    const { id } = req.params
    const { payload: { sub, role } } = req.user

    const assessmentFileSchema = z.object({
      originalname: z.string(),
      filename: z.string(),
    })

    const { filename, originalname } = assessmentFileSchema.parse(req.file)

    const fullUrl = req.protocol.concat('://').concat(req.hostname)
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

    const students = createStudentsBatchExcelToJSON(fileUrl.pathname)

    const ip = req.ip

    makeOnStudentBatchCreated()
    const useCase = makeCreateStudentsBatchUseCase()
    const result = await useCase.execute({
      courseId: id,
      fileLink: fileUrl.href,
      fileName: originalname,
      students,
      role,
      userId: sub, 
      userIp: ip
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case NotAllowedError: 
          throw new NotAllowed('Nível de acesso inválido')
        case ResourceAlreadyExistError: 
          throw new Conflict(error.message)
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
        default: 
          throw new ClientError('Houve algum problema')
      }
    }

    return res.status(201).send()
  })
}