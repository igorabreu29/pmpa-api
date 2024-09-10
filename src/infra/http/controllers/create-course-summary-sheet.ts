import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { makeCreateCourseSummarySheetUseCase } from "@/infra/factories/make-create-course-summary-sheet-use-case.ts";

export async function createCourseSummarySheet(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/summary', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid()
        })
      },
    }, async (req, res) => {
      const { courseId } = req.params

      const useCase = makeCreateCourseSummarySheetUseCase()
      const result = await useCase.execute({
        courseId
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

      const { filename } = result.value

      const fullUrl = req.protocol.concat('://').concat(req.hostname)
      const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

      return res.send({
        fileUrl: fileUrl.href
      })
    })
}