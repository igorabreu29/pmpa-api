import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { InvalidCourseFormulaError } from "@/domain/boletim/app/use-cases/errors/invalid-course-formula-error.ts"
import { makeUpdateCourseClassificationUseCase } from "@/infra/factories/make-update-course-classification-use-case.ts"
import { ClientError } from "@/infra/http/errors/client-error.ts"
import { Conflict } from "@/infra/http/errors/conflict-error.ts"
import { NotAllowed } from "@/infra/http/errors/not-allowed.ts"
import { NotFound } from "@/infra/http/errors/not-found.ts"

export interface UpdateClassificationJobProps {
  data: {
    courseId: string
  }
}

export const updateClassificationJobConfig = {
  key: 'update-classification-job',
  async handle({ data }: UpdateClassificationJobProps) {
    const { courseId } = data

    const useCase = makeUpdateCourseClassificationUseCase()
    const result = await useCase.execute({
      courseId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch(error.constructor) {
        case ResourceNotFoundError: 
          throw new NotFound(error.message)
        case InvalidCourseFormulaError:
          throw new Conflict(error.message)
        case NotAllowedError:
          throw new NotAllowed(error.message)
        default: 
          throw new ClientError('Houve algum erro')
      }
    }
  }
}