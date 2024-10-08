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

    const { studentsPole } = await this.studentsPolesRepository.findManyDetailsByPoleId({ poleId: poleIdAssigned })
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
        studentId: student.studentId.toValue(),
        studentCivilOrMilitaryId: student.militaryId ?? student.civilId,
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentPole: student.pole,
        studentName: student.username
      }
    }))

    const error = studentsWithAverageOrError.find(item => item instanceof ResourceNotFoundError)
    if (error) return left(error)

    if (disciplineModule === 3) {
      const classifiedByCFPFormula = classificationByCourseFormula['SUB'](studentsWithAverageOrError as StudentClassficationByPeriod[])
  
      const classifiedByCFPFormulaPaginated = page ? classifiedByCFPFormula.slice((page - 1) * 30, page * 30) : classifiedByCFPFormula
  
      const pagesCFP = Math.ceil(classifiedByCFPFormula.length / 30)
      const totalItemsCFP = classifiedByCFPFormula.length
      return right({ studentsWithAverage: classifiedByCFPFormulaPaginated, pages: pagesCFP, totalItems: totalItemsCFP })
    }

    const classifiedByCFPFormula = classificationByCourseFormula['CFP'](studentsWithAverageOrError as StudentClassficationByModule[])
  
    const classifiedByCFPFormulaPaginated = page ? classifiedByCFPFormula.slice((page - 1) * 30, page * 30) : classifiedByCFPFormula

    const pagesCFP = Math.ceil(classifiedByCFPFormula.length / 30)
    const totalItemsCFP = classifiedByCFPFormula.length
    return right({ studentsWithAverage: classifiedByCFPFormulaPaginated, pages: pagesCFP, totalItems: totalItemsCFP })
  }
}