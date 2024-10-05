import { left, right, type Either } from "@/core/either.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import type { StudentsRepository } from "../repositories/students-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { StudentCourseDeletedEvent } from "../../enterprise/events/student-course-deleted-event.ts"
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"

interface DeleteStudentCourseUseCaseRequest {
  courseId: string
  studentId: string

  role: string
  userId: string
  userIp: string
}

type DeleteStudentCourseUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError, null>

export class DeleteStudentCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentsRepository: StudentsRepository,
    private studentCoursesRepository: StudentsCoursesRepository
  ) {}

  async execute({ courseId, studentId, role, userId, userIp }: DeleteStudentCourseUseCaseRequest): Promise<DeleteStudentCourseUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente!'))

    const student = await this.studentsRepository.findById(studentId)
    if (!student) return left(new ResourceNotFoundError('Estudante não existente!'))

    const studentCourse = await this.studentCoursesRepository.findByStudentIdAndCourseId({
      courseId: course.id.toValue(),
      studentId: student.id.toValue()
    })
    if (!studentCourse) return left(new ResourceNotFoundError('O estudante não está presente no curso.'))

    studentCourse.addDomainStudentCourseEvent(
      new StudentCourseDeletedEvent({
        reporterId: userId,
        reporterIp: userIp,
        studentCourse
      })
    ) 

    await this.studentCoursesRepository.delete(studentCourse)

    return right(null)
  }
}