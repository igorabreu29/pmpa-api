import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import { PolesRepository } from "../repositories/poles-repository.ts";

interface SearchStudentCourseByPoleDetailsUseCaseRequest {
  courseId: string
  poleId: string
  query: string
  page: number
}

type SearchStudentCourseByPoleDetailsUseCaseResponse = Either<ResourceNotFoundError, {
  students: StudentCourseDetails[]
  pages: number
  totalItems: number
}>

export class SearchStudentCourseByPoleDetailsUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private studentsPolesRepository: StudentsPolesRepository
  ) {}

  async execute({
    courseId,
    poleId,
    query,
    page
  }: SearchStudentCourseByPoleDetailsUseCaseRequest): Promise<SearchStudentCourseByPoleDetailsUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pólo não encontrado!'))

    const { studentCoursesDetails: students, pages, totalItems } = await this.studentsPolesRepository.searchManyDetailsByPoleId({
      poleId,
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