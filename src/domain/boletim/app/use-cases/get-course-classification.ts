import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { classificationByCourseFormula } from "../utils/generate-course-classification.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";

interface GetCourseClassificationUseCaseRequest {
  courseId: string
  page?: number
  hasBehavior?: boolean
}

type GetCourseClassificationUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  studentsWithAverage: StudentClassficationByPeriod[] | StudentClassficationByModule[]
  pages?: number
  totalItems?: number
}>

export class GetCourseClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ courseId, page, hasBehavior = true }: GetCourseClassificationUseCaseRequest): Promise<GetCourseClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const { studentsCourse: students } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId })

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod,
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

    switch (course.formula) {
      case 'CGS': 
        const classifiedByCGSFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByModule[])
        const classifiedByCGSFormulaPaginated = page ? classifiedByCGSFormula.slice((page - 1) * 30, page * 30) : classifiedByCGSFormula

        const pages = Math.ceil(classifiedByCGSFormula.length / 30)
        const totalItems = classifiedByCGSFormula.length

        return right({ studentsWithAverage: classifiedByCGSFormulaPaginated, pages, totalItems })
      case 'CAS': 
        const classifiedByCASFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByModule[])
        const classifiedByCASFormulaPaginated = page ? classifiedByCASFormula.slice((page - 1) * 30, page * 30) : classifiedByCASFormula

        const pagesCas = Math.ceil(classifiedByCASFormula.length / 30)
        const totalItemsCas = classifiedByCASFormula.length
        return right({ studentsWithAverage: classifiedByCASFormulaPaginated, pages: pagesCas, totalItems: totalItemsCas })
      case 'CFP': 
        const classifiedByCFPFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByModule[])

        const classifiedByCFPFormulaPaginated = page ? classifiedByCFPFormula.slice((page - 1) * 30, page * 30) : classifiedByCFPFormula

        const pagesCFP = Math.ceil(classifiedByCFPFormula.length / 30)
        const totalItemsCFP = classifiedByCFPFormula.length
        return right({ studentsWithAverage: classifiedByCFPFormulaPaginated, pages: pagesCFP, totalItems: totalItemsCFP })
      case 'CHO': 
        const classifiedByCFOFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByModule[])
        const classifiedByCFOFormulaPaginated = page ? classifiedByCFOFormula.slice((page - 1) * 30, page * 30) : classifiedByCFOFormula

        const pagesCFO = Math.ceil(classifiedByCFOFormula.length / 30)
        const totalItemsCFO = classifiedByCFOFormula.length
        return right({ studentsWithAverage: classifiedByCFOFormulaPaginated, pages: pagesCFO, totalItems: totalItemsCFO })
      case 'CFO': 
        const classifiedByCHOFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByPeriod[])
        const classifiedByCHOFormulaPaginated = page ? classifiedByCHOFormula.slice((page - 1) * 30, page * 30) : classifiedByCHOFormula

        const pagesCHO = Math.ceil(classifiedByCHOFormula.length / 30)
        const totalItemsCHO = classifiedByCHOFormula.length
        return right({ studentsWithAverage: classifiedByCHOFormulaPaginated, pages: pagesCHO, totalItems: totalItemsCHO })
      default: 
        return left(new InvalidCourseFormulaError(`Esta fórmula: ${course.formula} é inválida.`))
    }
  }
}