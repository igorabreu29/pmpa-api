import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import type { ClassificationsRepository } from "../repositories/classifications-repository.ts";
import type { Classification } from "../../enterprise/entities/classification.ts";
import type { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import { classificationByCourseFormula } from "../utils/generate-course-classification.ts";

interface GetCourseClassificationUseCaseRequest {
  courseId: string
  page?: number
}

type GetCourseClassificationUseCaseResponse = Either<ResourceNotFoundError, {
  classifications: Classification[]
  students: StudentCourseDetails[]
  pages?: number
  totalItems?: number
}>

export class GetCourseClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private classificationsRepository: ClassificationsRepository,
  ) {}

  async execute({ courseId, page }: GetCourseClassificationUseCaseRequest): Promise<GetCourseClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const { classifications, pages, totalItems } = await this.classificationsRepository.findManyByCourseId({
      courseId,
      page
    })

    const studentsOrError = await Promise.all(classifications.map(async classification => {
      const student = await this.studentCoursesRepository.findDetailsByCourseAndStudentId({
        courseId: course.id.toValue(),
        studentId: classification.studentId.toValue()
      })
      if (!student) return new ResourceNotFoundError('Estudante não encontrado!')

      return student
    }))

    const error = studentsOrError.find(item => item instanceof ResourceNotFoundError)
    if (error) return left(error)

    const students = studentsOrError as StudentCourseDetails[]

    const classificationsSorted = classificationByCourseFormula[course.formula](classifications)
    
    return right({
      classifications: classificationsSorted,
      students,
      pages,
      totalItems
    })
  }
}