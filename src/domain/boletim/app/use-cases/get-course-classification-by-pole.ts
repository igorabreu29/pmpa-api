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

interface GetCourseClassificationByManagerUseCaseRequest {
  courseId: string
  page: number
  managerId?: string
  poleId?: string
}

type GetCourseClassificationByManagerUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError | Error[], {
  studentsWithAverage: StudentClassficationByPeriod[] | StudentClassficationByModule[]
}>

export class GetCourseClassificationByPoleUseCase {
  constructor ( 
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private managersCoursesRepository: ManagersCoursesRepository,
    private studentsPolesRepository: StudentsPolesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ managerId, courseId, page, poleId }: GetCourseClassificationByManagerUseCaseRequest): Promise<GetCourseClassificationByManagerUseCaseResponse> {
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

    const { studentsPole: students } = await this.studentsPolesRepository.findManyByPoleId({ poleId: poleIdAssigned, page, perPage: 30 })

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod
      })

      if (studentAverage.isLeft()) return new ResourceNotFoundError(studentAverage.value.message)
      
      return {
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentCivilID: student.civilId,
        studentPole: student.pole
      }
    }))

    const errors = studentsWithAverageOrError.filter(item => item instanceof ResourceNotFoundError)
    if (errors.length) return left(errors.map(error => error))

    switch (course.formula) {
      case 'CGS': 
        const classifiedByCGSFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByModule[])
        return right({ studentsWithAverage: classifiedByCGSFormula })
      case 'CAS': 
        const classifiedByCASFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByModule[])
        return right({ studentsWithAverage: classifiedByCASFormula })
      case 'CFP': 
        const classifiedByCFPFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByModule[])
        return right({ studentsWithAverage: classifiedByCFPFormula })
      case 'CFO': 
        const classifiedByCFOFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByPeriod[])
        return right({ studentsWithAverage: classifiedByCFOFormula })
      case 'CHO': 
        const classifiedByCHOFormula = classificationByCourseFormula[course.formula](studentsWithAverageOrError as StudentClassficationByPeriod[])
        return right({ studentsWithAverage: classifiedByCHOFormula })
      default: 
        return left(new InvalidCourseFormulaError(`This formula: ${course.formula} is invalid.`))
    }
  }
}