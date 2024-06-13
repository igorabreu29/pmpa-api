import { Either, left, right } from "@/core/either.ts"
import { CourseDiscipline, Expected } from "@/domain/enterprise/entities/course-discipline.ts"
import { CourseDisciplinesRepository } from "../repositories/course-discipline-repository.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"

interface AssignDisicplineToCourseUseCaseRequest {
  courseId: string
  disciplineId: string
  module: number
  expected: Expected
  hours: number
  weight: number
}

type AssignDisicplineToCourseUseCaseResponse = Either<ResourceAlreadyExistError | ResourceNotFoundError, null>

export class AssignDisicplineToCourseUseCase {
  constructor(
    private courseDisciplinesRepository: CourseDisciplinesRepository
  ) {}

  async execute({ courseId, disciplineId, expected, hours, module, weight }: AssignDisicplineToCourseUseCaseRequest): Promise<AssignDisicplineToCourseUseCaseResponse> {
    const disciplinePreviousAddedOnTheCourse = await this.courseDisciplinesRepository.findByCourseIdAndDisciplineId({ courseId, disciplineId })
    if (disciplinePreviousAddedOnTheCourse) return left(new ResourceAlreadyExistError('Discipline already present on the course.'))

    const courseDiscipline = CourseDiscipline.create({
      courseId: new UniqueEntityId(courseId),
      disciplineId: new UniqueEntityId(disciplineId),
      expected,
      hours,
      module, 
      weight
    })
    await this.courseDisciplinesRepository.create(courseDiscipline)

    return right(null)
  }
}