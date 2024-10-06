import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeUpdateStudentUseCase } from "@/infra/factories/make-update-student-use-case.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { makeChangeStudentProfileUseCase } from "@/infra/factories/make-change-student-profile-use-case.ts";

export async function changeStudentProfile(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch('/students', {
      onRequest: [verifyJWT, verifyUserRole(['student'])],
      schema: {
        body: z.object({
          username: z.string(),
          email: z.string().optional(),
          password: z.string().optional(),
          birthday: z.string().optional().transform((birthday) => {
            if (birthday) {
              const [day, month, year] = birthday.split('/')

              const date = new Date()
              date.setFullYear(Number(year), Number(month), Number(day))
  
              return date
            }

            return undefined
          }),
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

    const useCase = makeChangeStudentProfileUseCase()
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
          throw new Conflict('Email inválido!') 
        case InvalidPasswordError:
          throw new Conflict('Senha inválida!') 
        case InvalidBirthdayError:
          throw new Conflict('Data de nascimento inválida!') 
        case InvalidNameError:
          throw new Conflict('Nome inválido!') 
        default: 
          throw new ClientError('Houve algum problema')
      }
    }

    return res.status(204).send()
  })
}