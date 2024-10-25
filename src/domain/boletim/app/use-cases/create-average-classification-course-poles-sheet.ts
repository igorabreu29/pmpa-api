import { Either, left, right } from "@/core/either.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import type { Sheeter } from "../files/sheeter.ts";
import type { GetAverageClassificationCoursePolesUseCase } from "./get-average-classification-course-poles.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";

interface CreateAverageClassificationCoursePolesSheetUseCaseRequest {
  courseId: string
}

type CreateAverageClassificationCoursePolesSheetUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  filename: string
}>

export class CreateAverageClassificationCoursePolesSheetUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private getAverageClassificationCoursePoles: GetAverageClassificationCoursePolesUseCase,
    private sheeter: Sheeter
  ) {}
  
  async execute({ courseId }: CreateAverageClassificationCoursePolesSheetUseCaseRequest): Promise<CreateAverageClassificationCoursePolesSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const result = await this.getAverageClassificationCoursePoles.execute({
      courseId: course.id.toValue()
    })

    if (result.isLeft()) {
      const error = result.value
      return left(error)
    }

    const { studentsAverageGroupedByPole } = result.value

    const { filename } = this.sheeter.write({
      keys: [
        'CLASSIFICAÇÃO',
        'POLO',
        'MÉDIA DO POLO'
      ],
      rows: studentsAverageGroupedByPole.map((studentAverageGroupedByPole, index) => {
        return {
          classification: index + 1,
          pole: studentAverageGroupedByPole.poleAverage.name,
          average: studentAverageGroupedByPole.poleAverage.average,
        }
      }),
      sheetName: `${course.name.value} - Classificação de Médias.xlsx`
    })

    return right({
      filename
    })
  } 
}