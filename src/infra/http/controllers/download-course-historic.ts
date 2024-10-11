import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";

import { makeDownloadHistoricUseCase } from "@/infra/factories/make-download-historic-use-case.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";

export async function downloadCourseHistoric(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/historics/download', {
      onRequest: [verifyJWT],
      schema: {
        body: z.object({
          courseId: z.string().uuid(),
          studentId: z.string().uuid()
        })
      }
  }, async (req, res) => {
    const { courseId, studentId } = req.body

    const useCase = makeDownloadHistoricUseCase()
    const result = await useCase.execute({
      courseId,
      studentId
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

    const fullUrl = req.protocol.concat('://').concat(req.host)
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

    return res.status(201).send({
      fileUrl: fileUrl.href
    })
  })
}