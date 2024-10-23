import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { makeCreateCourseAssessmentClassificationSheetUseCase } from "@/infra/factories/make-create-course-assessment-classification-sheet-use-case.ts";
import { makeCreateManagerAssessmentClassificationSheetUseCase } from "@/infra/factories/make-create-manager-assessment-classification-use-case.ts";

export async function createAssessmentClassificationSheet(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/manager/classification/assessments/sheet', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid()
        }),
      },
    }, async (req, res) => {
      const { courseId } = req.params
      const { payload } = req.user
      
      const useCase = makeCreateManagerAssessmentClassificationSheetUseCase()
      const result = await useCase.execute({
        courseId,
        managerId: payload.sub
      })

      if (result.isLeft()) {
        const error = result.value

        switch(error.constructor) {
          case ResourceNotFoundError: 
            throw new NotFound(error.message)
          default: 
            throw new ClientError('Houve algum erro.')
        }
      }

      const { filename } = result.value

      const fullUrl = req.protocol.concat('://').concat(req.host)
      const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

      return res.status(201).send({
        fileUrl: fileUrl.href
      })
    })
}