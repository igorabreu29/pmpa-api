import { left, right, type Either } from "@/core/either.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts"
import type { ClassificationsRepository } from "../repositories/classifications-repository.ts"
import { ConflictError } from "./errors/conflict-error.ts"
import { Classification } from "../../enterprise/entities/classification.ts"
import type { AssessmentWithModule } from "../utils/verify-formula.ts"
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"

interface CreateStudentClassificationUseCaseRequest {
  courseId: string
  studentId: string
}

type CreateStudentClassificationUseCaseResponse = Either<
  | ResourceNotFoundError
  | ConflictError
, null>

export class CreateStudentClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase,
    private classificationsRepository: ClassificationsRepository
  ) {}

  async execute({
    courseId,
    studentId,
  }: CreateStudentClassificationUseCaseRequest): Promise<CreateStudentClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const studentCourse = await this.studentCoursesRepository.findDetailsByCourseAndStudentId({
      courseId: course.id.toValue(),
      studentId
    })
    if (!studentCourse) return left(new ResourceNotFoundError('Estudante não pertence a este curso.'))

    const studentCourseClassification = await this.classificationsRepository.findByCourseAndStudentId({
      courseId: course.id.toValue(),
      studentId
    })

    if (studentCourseClassification) return left(new ResourceAlreadyExistError('Student já possui uma classificação nesse curso!'))

    const studentAverageOrError = await this.getStudentAverageInTheCourseUseCase.execute({
      studentId: studentCourse.studentId.toValue(),
      courseId: studentCourse.courseId.toValue(),
      isPeriod: course.isPeriod,
      hasBehavior: true
    })
    if (studentAverageOrError.isLeft()) return left(studentAverageOrError.value)

    const studentAverage = studentAverageOrError.value

    const generalAverage = Number(studentAverage.grades.averageInform.geralAverage)

    const studentClassification = Classification.create({
      courseId: studentCourse.courseId,
      studentId: studentCourse.studentId,
      poleId: studentCourse.poleId,
      behaviorsCount: studentAverage.grades.averageInform.behaviorsCount,
      concept: studentAverage.grades.averageInform.studentAverageStatus.concept,
      status: studentAverage.grades.averageInform.studentAverageStatus.status,
      average: generalAverage || 0, 
      assessmentsCount: studentAverage.grades.assessmentsCount,
      assessments: studentAverage.grades.assessments as AssessmentWithModule[],
      studentBirthday: studentCourse.birthday,
    })

    await this.classificationsRepository.create(studentClassification)

    return right(null)
  }
}