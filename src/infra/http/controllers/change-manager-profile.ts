import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeUpdateManagerUseCase } from "@/infra/factories/make-update-manager-use-case.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeChangeManagerProfileUseCase } from "@/infra/factories/make-change-manager-profile-use-case.ts";

export async function changeManagerProfile(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/managers', {
      onRequest: [verifyJWT, verifyUserRole(['manager'])],
      schema: {
        body: z.object({
          username: z.string().optional(),
          email: z.string().optional(),
          password: z.string().optional(),
          birthday: z.string().transform(birthday => {
            const [day, month, year] = birthday.split('/')

            const date = new Date()
            date.setFullYear(Number(year), Number(month), Number(day))

            return date
          }).optional(),
          motherName: z.string().optional(),
          fatherName: z.string().optional(),
          civilId: z.string().optional(),
          militaryId: z.string().optional(),
          state: z.string().optional(),
          county: z.string().optional()
        })
      },
    }, 
  async (req, res) => {
    const { 
      username, 
      email, 
      password, 
      birthday, 
      motherName, 
      fatherName,
      civilId,
      militaryId,
      county,
      state 
    } = req.body
    const { payload } = req.user

    const useCase = makeChangeManagerProfileUseCase()
    const result = await useCase.execute({
      id: payload.sub,
      username,
      email,
      password,
      birthday,
      motherName, 
      fatherName,
      civilId,
      militaryId,
      county,
      state 
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case InvalidEmailError:
          throw new Conflict('This email is not valid.') 
        case InvalidPasswordError:
          throw new Conflict('This password is not valid.') 
        case InvalidBirthdayError:
          throw new Conflict('This birthday is not valid.') 
        case InvalidNameError:
          throw new Conflict('This name is not valid.') 
        case InvalidBirthdayError:
          throw new Conflict('This date is not valid.') 
        default: 
          throw new ClientError('Ocurred something problem')
      }
    }

    return res.status(204).send()
  })
}