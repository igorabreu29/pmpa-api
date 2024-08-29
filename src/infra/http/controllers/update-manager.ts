import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { makeUpdateManagerUseCase } from "@/infra/factories/make-update-manager-use-case.ts";
import { makeOnManagerUpdated } from "@/infra/factories/make-on-manager-updated.ts";

export async function updateManager(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/managers/:id', {
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),
        body: z.object({
          courseId: z.string().uuid(),
          newCourseId: z.string().uuid(),
          poleId: z.string().uuid(),
          username: z.string().min(3).max(50).optional(),
          email: z.string().email().optional(),
          cpf: z.string().min(14).max(14).optional(),
          password: z.string().min(6).max(20).optional(),
          birthday: z.string().transform(birthday => {
            const [day, month, year] = birthday.split('/')

            const date = new Date()
            date.setFullYear(Number(year), Number(month), Number(day))

            return date
          }).optional(),
          civilId: z.string().optional(),
          militaryId: z.string().optional(),
          motherName: z.string().min(3).max(50).optional(),
          fatherName: z.string().min(3).max(50).optional(),
          state: z.string().optional(),
          county: z.string().optional()
        })
      },
    }, 
  async (req, res) => {
    const { id } = req.params
    const { username, email, cpf, password, birthday, civilId, militaryId, county, state, motherName, fatherName, courseId, newCourseId, poleId } = req.body
    const { payload: { sub, role } } = req.user

    const ip = req.ip

    makeOnManagerUpdated()
    const useCase = makeUpdateManagerUseCase()
    const result = await useCase.execute({
      id,
      courseId,
      newCourseId,
      poleId,
      username,
      email,
      cpf,
      password,
      birthday,
      civilId,
      role,
      userId: sub, 
      userIp: ip,
      militaryId,
      county,
      state,
      motherName,
      fatherName
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case NotAllowedError: 
          throw new NotAllowed('Invalid access level')
        case InvalidEmailError:
          throw new Conflict('This email is not valid.') 
        case InvalidPasswordError:
          throw new Conflict('This password is not valid.') 
        case InvalidBirthdayError:
          throw new Conflict('This birthday is not valid.') 
        case InvalidNameError:
          throw new Conflict('This name is not valid.') 
        case InvalidCPFError:
          throw new Conflict('This cpf is not valid.') 
        case InvalidBirthdayError:
          throw new Conflict('This date is not valid.') 
        default: 
          throw new ClientError('Ocurred something problem')
      }
    }

    return res.status(204).send()
  })
}