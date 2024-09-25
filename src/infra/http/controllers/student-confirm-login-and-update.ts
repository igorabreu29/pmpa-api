import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeMarkLoginConfirmedAsTrueAndUpdateStudentUseCase } from "@/infra/factories/make-mark-login-confirmed-as-true-and-update-student-use-case.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { makeOnStudentLoginConfirmed } from "@/infra/factories/make-on-student-login-confirmed.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";

export async function studentConfirmLoginAndUpdate(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/students/confirm', {
      onRequest: [verifyJWT],
      schema: {
        body: z.object({
          fatherName: z.string().optional(),
          motherName: z.string().min(3).max(50),
          militaryId: z.string().optional(),
          state: z.string().optional(),
          county: z.string().optional()
        })
      }
    }, async (req, res) => {
      const { fatherName, motherName, militaryId, state, county} = req.body
      const { payload } = req.user

      const ip = req.ip

      makeOnStudentLoginConfirmed()
      const useCase = makeMarkLoginConfirmedAsTrueAndUpdateStudentUseCase()
      const result = await useCase.execute({
        id: payload.sub,
        fatherName,
        motherName,
        militaryId,
        state,
        county,
        studentIp: ip
      })

      if (result.isLeft()) {
        const error = result.value

        switch(error.constructor) {
          case ResourceNotFoundError:
            throw new NotFound(error.message)
          default: 
            throw new ClientError('Houve algum erro')
        }
      }

      return res.status(204).send()
    })
}