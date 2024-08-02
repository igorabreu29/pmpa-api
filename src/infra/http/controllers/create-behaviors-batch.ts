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
import { ClientError } from "../errors/client-error.ts";
import { ConflictError } from "@/domain/boletim/app/use-cases/errors/conflict-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { makeCreateBehaviorsBatchUseCase } from "@/infra/factories/make-create-behaviors-batch-use-case.ts";
import { upload } from "@/infra/libs/multer.ts";
import { resolve } from "node:path";
import excelToJson from "convert-excel-to-json";

interface ExcelBehaviorsBatch {
  [key: string]: {
    cpf: string
    january: number | null
    february: number | null
    march: number | null
    april: number | null
    may: number | null
    jun: number | null
    july: number | null
    august: number | null
    september: number | null
    october: number | null
    november: number | null
    december: number | null
  }[]
}

export async function createBehaviorBatch(
  app: FastifyInstance
) {
  app 
    .withTypeProvider<ZodTypeProvider>()
    .post('/behaviors/batch', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      preHandler: upload.single('excel'),
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
  
      const converted: ExcelBehaviorsBatch = excelToJson({
        sourceFile: resolve(import.meta.dirname, `../../../../${fileUrl.pathname}`),
        header: {
          rows: 1,
        },
        columnToKey: {
          A: 'cpf',
          B: 'january',
          C: 'february',
          D: 'march',
          E: 'april',
          F: 'may',
          G: 'jun',
          H: 'july',
          I: 'august',
          J: 'september',
          K: 'october',
          L: 'november',
          M: 'december'
        },
        sheets: ['Página1'],
      })

      const studentBehaviors = converted['Página1'].map(item => ({
        ...item,
        cpf: String(item.cpf)
      }))

      const ip = req.ip

      const useCase = makeCreateBehaviorsBatchUseCase()
      const result = await useCase.execute({
        courseId,
        studentBehaviors,
        fileName: originalname,
        fileLink: fileUrl.href,
        role,
        userId: sub,
        userIp: ip
      })

      if (result.isLeft()) {
        const error = result.value
        
        switch(error.constructor) {
          case NotAllowedError: 
            throw new NotAllowed('Invalid access level')
          case ResourceNotFoundError:
            throw new NotFound(error.message)
          case ConflictError:
            throw new Conflict(error.message)
          case ResourceAlreadyExistError:
            throw new Conflict(error.message)
          default: 
            throw new ClientError('Ocurred something problem')
        }
      }

      return res.status(201).send()
    })
}
