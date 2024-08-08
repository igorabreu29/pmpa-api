import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { ConflictError } from "@/domain/boletim/app/use-cases/errors/conflict-error.ts";
import { makeCreateAssessmentsBatchUseCase } from "@/infra/factories/make-create-assessments-batch-use-case.ts";
import { upload } from "@/infra/libs/multer.ts";
import excelToJson from "convert-excel-to-json";
import { resolve } from "node:path";
import { ClientError } from "../errors/client-error.ts";

interface ExcelAssessmentsBatch {
  [key: string]: {
    cpf: string
    disciplineName: string
    vf: number
    avi?: number
    avii?: number
    vfe?: number
  }[]
}

export async function createAssessmentBatch(
  app: FastifyInstance
) {
  app 
    .withTypeProvider<ZodTypeProvider>()
    .post('/assessments/batch', {
      preHandler: upload.single('excel'),
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        querystring: z.object({
          courseId: z.string().cuid()
        })
      }
    }, async (req, res) => {
      const { courseId } = req.query
      const { payload: { role, sub } } = req.user

      const assessmentFileSchema = z.object({
        originalname: z.string(),
        filename: z.string(),
      })
  
      const { filename, originalname } = assessmentFileSchema.parse(req.file)

      const fullUrl = req.protocol.concat('://').concat(req.hostname)
      const fileUrl = new URL(`/uploads/${filename}`, fullUrl)
  
      const converted: ExcelAssessmentsBatch = excelToJson({
        sourceFile: resolve(import.meta.dirname, `../../../../${fileUrl.pathname}`),
        header: {
          rows: 1,
        },
        columnToKey: {
          A: 'cpf',
          B: 'disciplineName',
          C: 'vf',
          D: 'avi',
          E: 'avii',
          F: 'vfe',
        },
        sheets: ['Página1'],
      })

      const studentAssessments = converted['Página1'].map(item => ({
        ...item,
        cpf: String(item.cpf)
      }))

      const ip = req.ip

      const useCase = makeCreateAssessmentsBatchUseCase()
      const result = await useCase.execute({
        courseId,
        role,
        studentAssessments,
        fileName: originalname,
        fileLink: fileUrl.href,
        userId: sub,
        userIp: ip
      })

      if (result.isLeft()) {
        const error = result.value
        
        switch(error.constructor) {
          case NotAllowedError: 
            throw new NotAllowed('Invalid access level')
          case ResourceNotFoundError:
            const notFound = error as ResourceNotFoundError
            throw new NotFound(notFound.message)
          case ConflictError:
            const conflict = error as ConflictError
            throw new Conflict(conflict.message)
          default: 
            throw new ClientError('Ocurred something error')
        }
      }

      return res.status(201).send()
    })
}

