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
import { makeCreateCourseClassificationByManagerSheetUseCase } from "@/infra/factories/make-create-course-classification-by-manager-sheet-use-case.ts";

export async function createClassificationByManagerSheet(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/courses/:id/manager/classification/sheet', {
      onRequest: [verifyJWT, verifyUserRole(['manager'])],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),

        querystring: z.object({
          hasBehavior: z.string().transform(item => item === 'true')
        })
      },
    }, async (req, res) => {
      const { id } = req.params
      const { hasBehavior } = req.query
      const { payload } = req.user

      const useCase = makeCreateCourseClassificationByManagerSheetUseCase()
      const result = await useCase.execute({
        courseId: id,
        managerId: payload.sub,
        hasBehavior,
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