import { left, right, type Either } from "@/core/either.ts"
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts"
import type { StudentsPolesRepository } from "../repositories/students-poles-repository.ts"

interface FetchLoginConfirmationMetricsByManagerRequest {
  courseId: string
  managerId: string
}

interface StudentGroupedByPole {
  poleId: UniqueEntityId;
  pole: string;
  metrics: {
      totalConfirmedSize: number;
      totalNotConfirmedSize: number;
  };
}

type FetchLoginConfirmationMetricsByManagerResponse = Either<
  | ResourceNotFoundError,
  {
    studentsMetricsByPole: StudentGroupedByPole
  }
>

export class FetchLoginConfirmationMetricsByManager {
  constructor (
    private coursesRepository: CoursesRepository,
    private managersCoursesRepository: ManagersCoursesRepository,
    private studentsPolesRepository: StudentsPolesRepository
  ) {}

  async execute({
    courseId,
    managerId
  }: FetchLoginConfirmationMetricsByManagerRequest): Promise<FetchLoginConfirmationMetricsByManagerResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const managerCourse = await this.managersCoursesRepository.findByManagerAndCourseIdWithPole({ courseId, managerId }) 
    if (!managerCourse) return left(new ResourceNotFoundError('Manager course not found'))

    const { studentsPole } = await this.studentsPolesRepository.findManyByPoleId({ poleId: managerCourse.poleId.toValue() })

    const totalConfirmedSize = studentsPole.filter(studentPole => {
      return studentPole.isLoginConfirmed
    }).length

    const totalNotConfirmedSize = studentsPole.filter(studentPole => {
      return !studentPole.isLoginConfirmed
    }).length

    const studentsMetricsByPole = {
      poleId: managerCourse.poleId,
      pole: managerCourse.pole,
      metrics: {
        totalConfirmedSize,
        totalNotConfirmedSize
      }
    }

    return right({
      studentsMetricsByPole
    })
  }
}