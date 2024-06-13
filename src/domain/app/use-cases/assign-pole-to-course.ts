import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { CoursePolesRepository } from "../repositories/pole-course-repository.ts"
import { CoursePole } from "@/domain/enterprise/entities/course-pole.ts"

interface AssignPoleToCourseUseCaseRequest {
  courseId: string
  poleId: string
}

type AssignPoleToCourseUseCaseResponse = Either<ResourceAlreadyExistError | ResourceNotFoundError, null>

export class AssignPoleToCourseUseCase {
  constructor(
    private coursePolesRepository: CoursePolesRepository
  ) {}

  async execute({ courseId, poleId }: AssignPoleToCourseUseCaseRequest): Promise<AssignPoleToCourseUseCaseResponse> {
    const polePreviousAddedOnTheCourse = await this.coursePolesRepository.findByCourseIdAndPoleId(courseId, poleId)
    if (polePreviousAddedOnTheCourse) return left(new ResourceAlreadyExistError('Pole already present on the course.'))

    const poleCourse = CoursePole.create({
      courseId: new UniqueEntityId(courseId),
      poleId: new UniqueEntityId(poleId)
    })
    await this.coursePolesRepository.create(poleCourse)

    return right(null)
  }
}