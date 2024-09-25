import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";

interface SearchStudentCourseDetailsUseCaseRequest {
  courseId: string
  query: string
  page: number
}

type SearchStudentCourseDetailsUseCaseResponse = Either<ResourceNotFoundError, {
  students: StudentCourseDetails[]
  pages: number
  totalItems: number
}>

export class SearchStudentCourseDetailsUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository
  ) {}

  async execute({
    courseId,
    query,
    page
  }: SearchStudentCourseDetailsUseCaseRequest): Promise<SearchStudentCourseDetailsUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const { studentCoursesDetails: students, pages, totalItems } = await this.studentsCoursesRepository.searchManyDetailsByCourseId({
      courseId,
      query,
      page
    })

    return right({
      students,
      pages,
      totalItems
    })
  }
}