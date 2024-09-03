import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { ChangeStudentStatusEvent } from "../../enterprise/events/change-student-status-event.ts";

interface DisableStudentCourseUseCaseRequest {
  id: string
  courseId: string
  reason: string

  role: Role
  userId: string
  userIp: string
}

type DisableStudentCourseUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class DisableStudentCourseUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository
  ) {}

  async execute({ id, courseId, reason, role, userId, userIp }: DisableStudentCourseUseCaseRequest): Promise<DisableStudentCourseUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    const studentCourse = await this.studentCoursesRepository.findByStudentIdAndCourseId({
      courseId,
      studentId: id
    })
    if (!studentCourse) return left(new ResourceNotFoundError('Student does not be present on the course.'))

    studentCourse.isActive = false

    studentCourse.addDomainStudentCourseEvent(
      new ChangeStudentStatusEvent({
        studentCourse,
        reason,
        reporterId: userId,
        reporterIp: userIp
      })
    )

    await this.studentCoursesRepository.updateStatus(studentCourse)

    return right(null)
  }
}