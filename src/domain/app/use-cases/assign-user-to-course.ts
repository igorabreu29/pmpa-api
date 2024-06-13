import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { UserCourse } from "@/domain/enterprise/entities/user-course.ts"
import { UsersCourseRepository } from "../repositories/users-course-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"

interface AssignUserToCourseUseCaseRequest {
  userId: string
  courseId: string
}

type AssignUserToCourseUseCaseResponse = Either<ResourceAlreadyExistError | ResourceNotFoundError, null>

export class AssignUserToCourseUseCase {
  constructor(
    private userCourseRepository: UsersCourseRepository
  ) {}

  async execute({ userId, courseId }: AssignUserToCourseUseCaseRequest): Promise<AssignUserToCourseUseCaseResponse> {
    const userAlreadyExistOnTheCourse = await this.userCourseRepository.findByCourseIdAndUserId({ courseId, userId })
    if (userAlreadyExistOnTheCourse) return left(new ResourceAlreadyExistError('User already present on the course.'))

    const userCourse = UserCourse.create({
      userId: new UniqueEntityId(userId),
      courseId: new UniqueEntityId(courseId),
    })
    await this.userCourseRepository.create(userCourse)

    return right(null)
  }
}