import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { makeCreateCourseClassificationSheetUseCase } from "@/infra/factories/make-create-course-classification-sheet-use-case.ts";
import { InvalidCourseFormulaError } from "@/domain/boletim/app/use-cases/errors/invalid-course-formula-error.ts";
import { Conflict } from "../errors/conflict-error.ts";

export async function createClassificationSheet(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/classification/sheet', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid()
        }),

        querystring: z.object({
          hasBehavior: z.string().transform(item => item === 'true')
        })
      },
    }, async (req, res) => {
      const { courseId } = req.params
      const { hasBehavior } = req.query

      const useCase = makeCreateCourseClassificationSheetUseCase()
      const result = await useCase.execute({
        courseId,
        hasBehavior
      })

      if (result.isLeft()) {
        const error = result.value

        switch(error.constructor) {
          case ResourceNotFoundError: 
            throw new NotFound(error.message)
          case InvalidCourseFormulaError: 
            throw new Conflict(error.message)
          default: 
            throw new ClientError()
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