import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { StudentWithCourse } from "../../enterprise/entities/value-objects/student-with-course.ts";

interface FetchStudentCoursesUseCaseRequest {
  studentId: string
  page: number
  perPage: number
}

type FetchStudentCoursesUseCaseResponse = Either<ResourceNotFoundError, {
  courses: StudentWithCourse[],
  pages: number,
  totalItems: number
}>

export class FetchStudentCoursesUseCase {
  constructor(
    private studentsRepository: StudentsRepository,
    private studentsCoursesRepository: StudentsCoursesRepository
  ) {}

  async execute({ studentId, page, perPage }: FetchStudentCoursesUseCaseRequest): Promise<FetchStudentCoursesUseCaseResponse> {
    const student = await this.studentsRepository.findById(studentId)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    const { studentCourses, pages, totalItems } = await this.studentsCoursesRepository.findManyByStudentIdWithCourse({ studentId, page, perPage })

    return right({ courses: studentCourses, pages, totalItems })
  }
}