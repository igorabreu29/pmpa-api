import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { makeGetStudentProfileUseCase } from "@/infra/factories/make-get-student-profile-use-case.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { ClientError } from "../errors/client-error.ts";
import { StudentDetailsPresenter } from "../presenters/student-details-presenter.ts";

export async function getStudentProfile(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/students/profile', {
      onRequest: [verifyJWT],
    }, 
    async (req, res) => {
      const { payload } = req.user
      
      const useCase = makeGetStudentProfileUseCase()
      const result = await useCase.execute({
        id: payload.sub
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

      const { student } = result.value

      const studentDetailsPresenter = StudentDetailsPresenter.toHTTP(student)

      return res.status(200).send({
        student: studentDetailsPresenter
      })
  })
}