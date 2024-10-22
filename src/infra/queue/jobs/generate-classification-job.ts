import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { InvalidCourseFormulaError } from "@/domain/boletim/app/use-cases/errors/invalid-course-formula-error.ts"
import { makeGenerateCourseClassificationUseCase } from "@/infra/factories/make-generate-course-classification-use-case.ts"
import { makeGetCourseClassificationUseCase } from "@/infra/factories/make-get-course-classification-use-case.ts"
import { ClientError } from "@/infra/http/errors/client-error.ts"
import { Conflict } from "@/infra/http/errors/conflict-error.ts"
import { NotAllowed } from "@/infra/http/errors/not-allowed.ts"
import { NotFound } from "@/infra/http/errors/not-found.ts"

export interface GenerateClassificationJobProps {
  data: {
    courseId: string
  }
}

export const generateClassificationJobConfig = {
  key: 'generate-classification-job',
  async handle({ data }: GenerateClassificationJobProps) {
    const { courseId } = data

    const useCase = makeGenerateCourseClassificationUseCase()
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