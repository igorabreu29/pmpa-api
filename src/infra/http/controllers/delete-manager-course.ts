import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { makeDeleteManagerCourseUseCase } from "@/infra/factories/make-delete-manager-course-use-case.ts";
import { makeOnManagerCourseDeleted } from "@/infra/factories/make-on-manager-course-deleted.ts";

export async function deleteManagerCourse(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/courses/:courseId/managers/:id', {
      onRequest: [verifyJWT, verifyUserRole(['dev'])],
      schema: {
        params: z.object({
          courseId: z.string().uuid(),
          id: z.string().uuid()
        })
      },
    }, 
  async (req, res) => {
    const { id, courseId } = req.params
    const { payload: { sub, role } } = req.user

    const ip = req.ip

    makeOnManagerCourseDeleted()
    const useCase = makeDeleteManagerCourseUseCase()
    const result = await useCase.execute({
      courseId,
      managerId: id,
      role,
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
        default: 
          throw new ClientError('Houve algum problema')
      }
    }

    return res.status(204).send()
  })
}