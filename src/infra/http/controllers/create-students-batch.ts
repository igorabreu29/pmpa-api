import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ClientError } from "../errors/client-error.ts";
import { ConflictError } from "../errors/conflict-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeCreateStudentsBatchUseCase } from "@/infra/factories/make-create-students-batch-use-case.ts";

import excelToJSON from 'convert-excel-to-json' 
import { resolve } from "node:path";
import { upload } from "@/infra/libs/multer.ts";
import { z } from "zod";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { NotAllowed } from "../errors/not-allowed.ts";

interface ExcelStudentsBatch {
  [key: string]: {
    username: string
    cpf: string
    email: string
    civilId: number
    courseName: string
    poleName: string
    birthday: Date
  }[]
}

export async function createStudentsBatch(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/students/batch', {
      preHandler: upload.single('excel'),
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
    }, 
  async (req, res) => {
    const { payload: { sub, role } } = req.user

    const assessmentFileSchema = z.object({
      originalname: z.string(),
      filename: z.string(),
    })

    const { filename, originalname } = assessmentFileSchema.parse(req.file)

    const fullUrl = req.protocol.concat('://').concat(req.hostname)
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

    const converted: ExcelStudentsBatch = excelToJSON({
      sourceFile: resolve(import.meta.dirname, `../../../../${fileUrl.pathname}`),
      header: {
        rows: 1
      },
      columnToKey: {
        A: 'cpf',
        B: 'username',
        C: 'email',
        D: 'civilId',
        E: 'birthday',
        F: 'courseName',
        G: 'poleName',
      },
      sheets: ['Página1'],
    })

    const students = converted['Página1'].map(item => ({
      ...item,
      cpf: String(item.cpf)
    }))

    const ip = req.ip

    const useCase = makeCreateStudentsBatchUseCase()
    const result = await useCase.execute({
      courseName: students[0].courseName,
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
          throw new NotFound('Course not found.')
        case NotAllowedError: 
          throw new NotAllowed('Invalid access level')
        default: 
          throw new ClientError('Ocurred something problem')
      }
    }

    return res.status(201).send()
  })
}