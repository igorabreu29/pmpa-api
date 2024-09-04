import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { makeActiveManagerCourseUseCase } from "@/infra/factories/make-active-manager-course-use-case.ts";
import { makeOnManagerActivated } from "@/infra/factories/make-on-manager-activated.ts";
import { makeOnManagerDisabled } from "@/infra/factories/make-on-manager-disabled.ts";
import { makeDisableManagerCourseUseCase } from "@/infra/factories/make-disable-manager-course-use-case.ts";

export async function disableManager(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/courses/:courseId/managers/:managerId/disable-status', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          managerId: z.string().uuid(),
          courseId: z.string().uuid(),
        }),
        body: z.object({
          reason: z.string().min(3, 'The reason message cannot be less than 3 characters').max(200, 'The reason message cannot be bigger than 200 characters')
        })
      },
    }, 
  async (req, res) => {
    const { courseId, managerId } = req.params
    const { reason } = req.body
    const { payload } = req.user

    const ip = req.ip

    makeOnManagerDisabled()
    const useCase = makeDisableManagerCourseUseCase()
    const result = await useCase.execute({
      id: managerId,
      courseId,
      reason,
      userIp: ip,
      userId: payload.sub,
      role: payload.role,
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case NotAllowedError: 
          throw new NotAllowed()
        default: 
          throw new ClientError()
      }
    }

    return res.status(204).send()
  })
}