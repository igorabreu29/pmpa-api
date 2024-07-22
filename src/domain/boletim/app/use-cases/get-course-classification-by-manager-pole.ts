import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { classificationByCourseFormula } from "../utils/generate-course-classification.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import { ManagersPolesRepository } from "../repositories/managers-poles-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";

interface GetCourseClassificationByManagerPoleUseCaseRequest {
  managerId: string
  courseId: string
  page: number
}

type GetCourseClassificationByManagerPoleUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  studentsWithAverage: StudentClassficationByPeriod[] | StudentClassficationByModule[]
}>

export class GetCourseClassificationByManagerPoleUseCase {
  constructor ( 
    private coursesRepository: CoursesRepository,
    private managersCoursesRepository: ManagersCoursesRepository,
    private managersPolesRepository: ManagersPolesRepository,
    private studentsPolesRepository: StudentsPolesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ managerId, courseId, page }: GetCourseClassificationByManagerPoleUseCaseRequest): Promise<GetCourseClassificationByManagerPoleUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const managerCourse = await this.managersCoursesRepository.findByManagerIdAndCourseId({ managerId, courseId: course.id.toValue() })
    if (!managerCourse) return left(new ResourceNotFoundError('Manager Course not found.'))

    const managerPole = await this.managersPolesRepository.findByManagerId({ managerId: managerCourse.id.toValue() })
    if (!managerPole) return left(new ResourceNotFoundError('Manager Pole not found.'))

    const { studentsPole: students } = await this.studentsPolesRepository.findManyByPoleId({ poleId: managerPole.poleId.toValue(), page, perPage: 30 })

    const studentsWithAverage = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod
      })

      if (studentAverage.isLeft()) return { message: studentAverage.value.message }
      
      return {
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentCivilID: student.civilID,
      }
    }))

    switch (course.formula) {
      case 'CGS': 
        const classifiedByCGSFormula = classificationByCourseFormula[course.formula](studentsWithAverage as StudentClassficationByModule[])
        return right({ studentsWithAverage: classifiedByCGSFormula })
      case 'CAS': 
        const classifiedByCASFormula = classificationByCourseFormula[course.formula](studentsWithAverage as StudentClassficationByModule[])
        return right({ studentsWithAverage: classifiedByCASFormula })
      case 'CFP': 
        const classifiedByCFPFormula = classificationByCourseFormula[course.formula](studentsWithAverage as StudentClassficationByModule[])
        return right({ studentsWithAverage: classifiedByCFPFormula })
      case 'CFO': 
        const classifiedByCFOFormula = classificationByCourseFormula[course.formula](studentsWithAverage as StudentClassficationByPeriod[])
        return right({ studentsWithAverage: classifiedByCFOFormula })
      case 'CHO': 
        const classifiedByCHOFormula = classificationByCourseFormula[course.formula](studentsWithAverage as StudentClassficationByPeriod[])
        return right({ studentsWithAverage: classifiedByCHOFormula })
      default: 
        return left(new InvalidCourseFormulaError(`This formula: ${course.formula} is invalid.`))
    }
  }
}