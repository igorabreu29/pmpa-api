import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import type { PolesRepository } from "../repositories/poles-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { classificationByCourseFormula } from "../utils/generate-course-classification.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import type { ClassificationsRepository } from "../repositories/classifications-repository.ts";
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import type { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import type { Classification } from "../../enterprise/entities/classification.ts";

interface GetCourseClassificationByPoleUseCaseRequest {
  courseId: string
  page?: number
  managerId?: string
  poleId?: string
  hasBehavior?: boolean
}

type GetCourseClassificationByPoleUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  classifications: Classification[]
  students: StudentCourseDetails[]
  pages?: number
  totalItems?: number
}>

export class GetCourseClassificationByPoleUseCase {
  constructor ( 
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private managersCoursesRepository: ManagersCoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private classificationsRepository: ClassificationsRepository,
  ) {}

  async execute({ managerId, courseId, page, poleId, hasBehavior = true }: GetCourseClassificationByPoleUseCaseRequest): Promise<GetCourseClassificationByPoleUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    let poleIdAssigned: string = ''

    if (poleId) {
      const pole = await this.polesRepository.findById(poleId)
      if (!pole) return left(new ResourceNotFoundError('Polo não encontrado!'))

      poleIdAssigned = pole.id.toValue()
    }

    if (managerId) {
      const managerCourse = await this.managersCoursesRepository.findDetailsByManagerAndCourseId({ managerId, courseId: course.id.toValue() })
      if (!managerCourse) return left(new ResourceNotFoundError('Gerente não está presente no curso!'))

      poleIdAssigned = managerCourse.poleId.toValue()
    }

    const { classifications, pages, totalItems } = await this.classificationsRepository.findManyByCourseAndPoleId({
      courseId,
      poleId: poleIdAssigned,
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