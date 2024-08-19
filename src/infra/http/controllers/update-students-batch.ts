import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ClientError } from "../errors/client-error.ts";
import { NotFound } from "../errors/not-found.ts";
import { verifyJWT } from "../middlewares/verify-jwt.ts";
import { verifyUserRole } from "../middlewares/verify-user-role.ts";
import { upload } from "@/infra/libs/multer.ts";
import { z } from "zod";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { NotAllowed } from "../errors/not-allowed.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Conflict } from "../errors/conflict-error.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { makeUpdateStudentsBatchUseCase } from "@/infra/factories/make-update-students-batch-use-case.ts";
import { updateStudentsBatchExcelToJSON } from "@/infra/utils/excel-to-json.ts";
import { makeOnStudentBatchUpdated } from "@/infra/factories/make-on-student-batch-updated.ts";

export async function updateStudentBatch(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/students/batch', {
      preHandler: upload.single('excel'),
      onRequest: [verifyJWT, verifyUserRole(['admin', 'dev', 'manager'])],
      schema: {
        querystring: z.object({
          courseId: z.string().cuid()
        })
      }
    }, 
  async (req, res) => {
    const { payload: { sub, role } } = req.user
    const { courseId } = req.query

    const assessmentFileSchema = z.object({
      originalname: z.string(),
      filename: z.string(),
    })

    const { filename, originalname } = assessmentFileSchema.parse(req.file)

    const fullUrl = req.protocol.concat('://').concat(req.hostname)
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl)

    const students = updateStudentsBatchExcelToJSON(fileUrl.pathname)

    const ip = req.ip

    makeOnStudentBatchUpdated()
    const useCase = makeUpdateStudentsBatchUseCase()
    const result = await useCase.execute({
      courseId,
      fileLink: fileUrl.href,
      fileName: originalname,
      students,
      role,
      userId: sub, 
      userIp: ip
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case NotAllowedError: 
          throw new NotAllowed('Invalid access level')
        case ResourceAlreadyExistError: 
          throw new Conflict(error.message)
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