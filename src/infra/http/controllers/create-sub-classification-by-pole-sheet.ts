import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { InvalidCourseFormulaError } from "@/domain/boletim/app/use-cases/errors/invalid-course-formula-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { makeCreateCourseClassificationByPoleSheetUseCase } from "@/infra/factories/make-create-course-classification-by-pole-sheet-use-case.ts";
import { makeCreateCourseSubClassificationByPoleSheetUseCase } from "@/infra/factories/make-create-course-sub-classification-by-pole-sheet-use-case.ts";

export async function createSubClassificationByPoleSheet(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:courseId/poles/:poleId/classification/sheet/sub', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid(),
          poleId: z.string().uuid()
        }),

        querystring: z.object({
          hasBehavior: z.string().transform(item => item === 'true'),
          disciplineModule: z.coerce.number().default(1),
        })
      },
    }, async (req, res) => {
      const { courseId, poleId } = req.params
      const { hasBehavior, disciplineModule } = req.query

      const useCase = makeCreateCourseSubClassificationByPoleSheetUseCase()
      const result = await useCase.execute({
        courseId,
        poleId,
        hasBehavior,
        disciplineModule,
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

      const fullUrl = req.protocol.concat('://').concat(req.hostname)
      const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

      return res.status(201).send({
        fileUrl: fileUrl.href
      })
    })
}