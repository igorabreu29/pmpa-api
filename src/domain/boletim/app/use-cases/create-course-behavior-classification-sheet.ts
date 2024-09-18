import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../sheet/sheeter.ts";
import type { GetCourseBehaviorClassificationUseCase } from "./get-course-behavior-classification.ts";

interface CreateCourseBehaviorClassificationSheetUseCaseRequest {
  courseId: string
}

type CreateCourseBehaviorClassificationSheetUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class CreateCourseBehaviorClassificationSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private getCourseBehaviorClassification: GetCourseBehaviorClassificationUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId }: CreateCourseBehaviorClassificationSheetUseCaseRequest): Promise<CreateCourseBehaviorClassificationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const classification = await this.getCourseBehaviorClassification.execute({
      courseId: course.id.toValue(),
    })

    if (classification.isLeft()) {
      const error = classification.value
      return left(error)
    }

    const { behaviorAverageGroupedByPole } = classification.value

    const { filename } = this.sheeter.write({
      keys: [
        'CLASSIFICAÇÃO',
        'PÓLO',
        'MÉDIA DO PÓLO'
      ],
      rows: behaviorAverageGroupedByPole.map((behaviorAverage, index) => {
        return {
          classification: index + 1,
          pole: behaviorAverage.poleAverage.name,
          average: behaviorAverage.poleAverage.average,
        }
      }),
      sheetName: `${course.name.value} - Classificação de Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}