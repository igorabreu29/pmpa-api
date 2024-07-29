import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import type { StudentsRepository } from "../repositories/students-repository.ts";

interface SearchStudentCourseDetailsUseCaseRequest {
  courseId: string
  query: string
  page: number
}

type SearchStudentCourseDetailsUseCaseResponse = Either<ResourceNotFoundError, {
  students: StudentCourseDetails[]
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
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const students = await this.studentsCoursesRepository.searchManyDetailsByCourseId({
      courseId,
      query,
      page
    })

    return right({
      students
    })
  }
}