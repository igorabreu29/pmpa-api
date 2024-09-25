import { Either, left, right } from "@/core/either.ts"
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"

interface GetCourseStudentUseCaseRequest {
  courseId: string
  id: string
}

type GetCourseStudentUseCaseResponse = Either<ResourceNotFoundError, {
  student: StudentCourseDetails
}>

export class GetCourseStudentUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
  ) {}

  async execute({ courseId, id }: GetCourseStudentUseCaseRequest): Promise<GetCourseStudentUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const student = await this.studentsCoursesRepository.findByStudentIdAndCourseId({ courseId, studentId: id })
    if (!student) return left(new ResourceNotFoundError('Estudante não está presente no curso.'))

    const studentCourseDetails = await this.studentsCoursesRepository.findDetailsByCourseAndStudentId({
      courseId,
      studentId: id
    })
    if (!studentCourseDetails) return left(new ResourceNotFoundError('Estudante não está presente no curso.'))

    return right({
      student: studentCourseDetails
    })
  }
}