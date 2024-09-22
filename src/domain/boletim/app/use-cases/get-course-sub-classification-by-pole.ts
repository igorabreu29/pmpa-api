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

interface GetCourseSubClassificationByPoleUseCaseRequest {
  courseId: string
  disciplineModule: number
  page?: number
  managerId?: string
  poleId?: string
  hasBehavior?: boolean
}

type GetCourseSubClassificationByPoleUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  studentsWithAverage: StudentClassficationByPeriod[] | StudentClassficationByModule[]
  pages?: number
  totalItems?: number
}>

export class GetCourseSubClassificationByPoleUseCase {
  constructor ( 
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private managersCoursesRepository: ManagersCoursesRepository,
    private studentsPolesRepository: StudentsPolesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ disciplineModule, managerId, courseId, page, poleId, hasBehavior = true }: GetCourseSubClassificationByPoleUseCaseRequest): Promise<GetCourseSubClassificationByPoleUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    let poleIdAssigned: string = ''

    if (poleId) {
      const pole = await this.polesRepository.findById(poleId)
      if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

      poleIdAssigned = pole.id.toValue()
    }

    if (managerId) {
      const managerCourse = await this.managersCoursesRepository.findDetailsByManagerAndCourseId({ managerId, courseId: course.id.toValue() })
      if (!managerCourse) return left(new ResourceNotFoundError('Manager Course not found.'))

      poleIdAssigned = managerCourse.poleId.toValue()
    }

    const { studentsPole, pages, totalItems } = await this.studentsPolesRepository.findManyDetailsByPoleId({ poleId: poleIdAssigned, page, perPage: 30 })
    const students = studentsPole.filter(studentPole => studentPole.courseId.equals(course.id))

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod,
        disciplineModule,
        hasBehavior
      })

      if (studentAverage.isLeft()) return studentAverage.value
      
      return {
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentName: student.username,
        studentCivilID: student.civilId,
        studentPole: student.pole
      }
    }))

    const error = studentsWithAverageOrError.find(item => item instanceof ResourceNotFoundError)
    if (error) return left(error)

    if (disciplineModule === 3) {
      const classifiedBySUBFormula = classificationByCourseFormula['SUB'](studentsWithAverageOrError as StudentClassficationByPeriod[])
      return right({ studentsWithAverage: classifiedBySUBFormula, pages, totalItems })
    }

    const classifiedByCFPFormula = classificationByCourseFormula['CFP'](studentsWithAverageOrError as StudentClassficationByModule[])
    return right({ studentsWithAverage: classifiedByCFPFormula, pages, totalItems })
  }
}