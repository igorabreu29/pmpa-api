import { left, right, type Either } from "@/core/either.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts"
import type { ClassificationsRepository } from "../repositories/classifications-repository.ts"
import { ConflictError } from "./errors/conflict-error.ts"
import { Classification } from "../../enterprise/entities/classification.ts"
import type { AssessmentWithModule } from "../utils/verify-formula.ts"

interface UpdateStudentClassificationUseCaseRequest {
  courseId: string
  studentId: string
  hasBehavior?: boolean
}

type UpdateStudentClassificationUseCaseResponse = Either<
  | ResourceNotFoundError
  | ConflictError
, null>

export class UpdateStudentClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase,
    private classificationsRepository: ClassificationsRepository
  ) {}

  async execute({
    courseId,
    studentId,
    hasBehavior
  }: UpdateStudentClassificationUseCaseRequest): Promise<UpdateStudentClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const studentCourseClassification = await this.classificationsRepository.findByCourseAndStudentId({
      courseId: course.id.toValue(),
      studentId
    })

    if (!studentCourseClassification) return left(new ConflictError('Student não possui classificação!'))

    const studentAverageOrError = await this.getStudentAverageInTheCourseUseCase.execute({
      studentId: studentCourseClassification.studentId.toValue(),
      courseId: studentCourseClassification.courseId.toValue(),
      isPeriod: course.isPeriod,
      hasBehavior: hasBehavior || true
    })
    if (studentAverageOrError.isLeft()) return left(studentAverageOrError.value)

    const studentAverage = studentAverageOrError.value

    const generalAverage = Number(studentAverage.grades.averageInform.geralAverage)

    const studentClassification = Classification.create({
      courseId: studentCourseClassification.courseId,
      studentId: studentCourseClassification.studentId,
      poleId: studentCourseClassification.poleId,
      behaviorsCount: studentAverage.grades.averageInform.behaviorsCount,
      concept: studentAverage.grades.averageInform.studentAverageStatus.concept,
      status: studentAverage.grades.averageInform.studentAverageStatus.status,
      average: generalAverage || 0, 
      assessmentsCount: studentAverage.grades.assessmentsCount,
      assessments: studentAverage.grades.assessments as AssessmentWithModule[],
      studentBirthday: studentCourseClassification.studentBirthday,
    }, studentCourseClassification.id)

    await this.classificationsRepository.save(studentClassification)

    return right(null)
  }
}