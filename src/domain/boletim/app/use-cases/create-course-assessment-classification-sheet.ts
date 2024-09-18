import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../sheet/sheeter.ts";
import type { GetCourseAssessmentClassificationUseCase } from "./get-course-assessment-classification.ts";

interface CreateCourseAssessmentClassificationSheetUseCaseRequest {
  courseId: string
}

type CreateCourseAssessmentClassificationSheetUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class CreateCourseAssessmentClassificationSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private getCourseAssessmentClassification: GetCourseAssessmentClassificationUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId }: CreateCourseAssessmentClassificationSheetUseCaseRequest): Promise<CreateCourseAssessmentClassificationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const classification = await this.getCourseAssessmentClassification.execute({
      courseId: course.id.toValue()
    })

    if (classification.isLeft()) {
      const error = classification.value
      return left(error)
    }

    const { assessmentAverageGroupedByPole } = classification.value

    const { filename } = this.sheeter.write({
      keys: [
        'CLASSIFICAÇÃO',
        'PÓLO',
        'MÉDIA DO PÓLO'
      ],
      rows: assessmentAverageGroupedByPole.map((assessmentAverage, index) => {
        return {
          classification: index + 1,
          pole: assessmentAverage.poleAverage.name,
          average: assessmentAverage.poleAverage.average,
        }
      }),
      sheetName: `${course.name.value} - Classificação de Avaliações.xlsx`
    })

    return right({
      filename
    })
  }
}