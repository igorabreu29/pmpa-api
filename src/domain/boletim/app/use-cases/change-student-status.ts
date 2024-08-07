import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";

interface ChangeStudentStatusUseCaseRequest {
  id: string
  courseId: string
  status: boolean

  role: Role
}

type ChangeStudentStatusUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class ChangeStudentStatusUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository
  ) {}

  async execute({ id, courseId, status, role }: ChangeStudentStatusUseCaseRequest): Promise<ChangeStudentStatusUseCaseResponse> {
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

    studentCourse.isActive = status
    await this.studentCoursesRepository.updateStatus(studentCourse)

    return right(null)
  }
}