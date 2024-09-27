import { Either, left, right } from "@/core/either.ts";
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";

interface CreateCourseSummarySheetUseCaseRequest {
  courseId: string
}

type CreateCourseSummarySheetUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class CreateCourseSummarySheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId }: CreateCourseSummarySheetUseCaseRequest): Promise<CreateCourseSummarySheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const courseDisciplines = await this.courseDisciplinesRepository.findManyByCourseIdWithDiscipliine({
      courseId: course.id.toValue()
    })

    const { filename } = this.sheeter.write({
      keys: ['DISCIPLINAS'],
      rows: courseDisciplines.map(courseDiscipline => ({
        name: courseDiscipline.disciplineName
      })),
      sheetName: `${course.name.value} - Ementas.xlsx`
    })

    return right({
      filename
    })
  }
}