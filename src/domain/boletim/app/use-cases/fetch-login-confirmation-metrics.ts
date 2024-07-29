import { left, right, type Either } from "@/core/either.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesPoleRepository } from "../repositories/courses-poles-repository.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"

interface FetchLoginConfirmationMetricsRequest {
  courseId: string
}

interface StudentGroupedByPole {
  poleId: UniqueEntityId;
  pole: string;
  metrics: {
      totalConfirmedSize: number;
      totalNotConfirmedSize: number;
  };
}

type FetchLoginConfirmationMetricsResponse = Either<
  | ResourceNotFoundError,
  {
    studentsMetricsByPole: StudentGroupedByPole[]
  }
>

export class FetchLoginConfirmationMetrics {
  constructor (
    private coursesRepository: CoursesRepository,
    private coursesPolesRepository: CoursesPoleRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
  ) {}

  async execute({
    courseId
  }: FetchLoginConfirmationMetricsRequest): Promise<FetchLoginConfirmationMetricsResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const coursePoles = await this.coursesPolesRepository.findManyByCourseId({ courseId })
    const studentsCourse = await this.studentsCoursesRepository.findManyByCourseIdWithPole({ courseId })
  
    const studentsMetricsByPole = coursePoles.map(coursePole => ({
      poleId: coursePole.id,
      pole: coursePole.name.value,
      metrics: {
        totalConfirmedSize: studentsCourse.filter(studentCourse => {
          return studentCourse.isLoginConfirmed && studentCourse.poleId.equals(coursePole.id)
        }).length,
        totalNotConfirmedSize: studentsCourse.filter(studentCourse => {
          return !studentCourse.isLoginConfirmed && studentCourse.poleId.equals(coursePole.id)
        }).length,
      }
    }))

    return right({
      studentsMetricsByPole
    })
  }
}