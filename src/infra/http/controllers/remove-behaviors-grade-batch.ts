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
import { upload } from "@/infra/libs/multer.ts";
import { ClientError } from "../errors/client-error.ts";
import { behaviorsBatchExcelToJSON } from "@/infra/utils/excel-to-json.ts";
import { makeRemoveBehaviorsGradeBatchUseCase } from "@/infra/factories/make-remove-behaviors-grade-batch-use-case.ts";
// import { makeOnBehaviorBatchUpdated } from "@/infra/factories/make-on-behavior-batch-updated.ts";

export async function removeBehaviorsGradeBatch(
  app: FastifyInstance
) {
  app 
    .withTypeProvider<ZodTypeProvider>()
    .put('/behaviors/batch/remove', {
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

      const behaviorsFileSchema = z.object({
        originalname: z.string(),
        filename: z.string(),
      })
  
      const { filename, originalname } = behaviorsFileSchema.parse(req.file)

      const fullUrl = req.protocol.concat('://').concat(req.hostname)
      const fileUrl = new URL(`/uploads/${filename}`, fullUrl)
  
      const studentBehaviors = behaviorsBatchExcelToJSON(fileUrl.pathname)
      
      const ip = req.ip

      // makeOnBehaviorBatchUpdated()
      const useCase = makeRemoveBehaviorsGradeBatchUseCase()
      const result = await useCase.execute({
        courseId,
        role,
        studentBehaviors,
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
            throw new NotFound(error.message)
          case ConflictError:
            throw new Conflict(error.message)
          default: 
            throw new ClientError('Houve algum erro')
        }
      }

      return res.status(204).send()
    })
}

