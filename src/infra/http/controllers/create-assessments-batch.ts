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
import { ClientError } from "../errors/client-error.ts";
import { assessmentsBatchExcelToJSON } from "@/infra/utils/excel-to-json.ts";
import { makeOnAssessmentBatchCreated } from "@/infra/factories/make-on-assessment-batch-created.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";


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
          courseId: z.string().uuid()
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

      const fullUrl = req.protocol.concat('://').concat(req.host)
      const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

      const studentAssessments = assessmentsBatchExcelToJSON(fileUrl.pathname)

      const ip = req.ip

      makeOnAssessmentBatchCreated()
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
            throw new NotAllowed('Nível de acesso inválido')
          case ResourceNotFoundError:
            const notFound = error as ResourceNotFoundError
            throw new NotFound(notFound.message)
          case ResourceAlreadyExistError:
            const alreadyExist = error as ResourceAlreadyExistError
            throw new Conflict(alreadyExist.message)
          case ConflictError:
            const conflict = error as ConflictError
            throw new Conflict(conflict.message)
          default: 
            throw new ClientError('Houve algum erro')
        }
      }

      return res.status(201).send()
    })
}

