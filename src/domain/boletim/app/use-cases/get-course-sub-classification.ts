import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { classificationByCourseFormula } from "../utils/generate-course-classification.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";

interface GetCourseSubClassificationUseCaseRequest {
  courseId: string
  module: number
  page?: number
  hasBehavior?: boolean
}

type GetCourseSubClassificationUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  studentsWithAverage: StudentClassficationByPeriod[] | StudentClassficationByModule[]
  pages?: number
  totalItems?: number
}>

export class GetCourseSubClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ courseId, module, page, hasBehavior = true }: GetCourseSubClassificationUseCaseRequest): Promise<GetCourseSubClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const { studentsCourse: students, pages, totalItems } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId, page, perPage: 30 })

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: module !== 3 ? false : true,
        hasBehavior,
        module: module !== 3 ? module : undefined
      })

      if (studentAverage.isLeft()) return studentAverage.value

      return {
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentCivilID: student.civilId,
        studentPole: student.pole,
        studentName: student.username
      }
    }))

    const error = studentsWithAverageOrError.find(item => item instanceof ResourceNotFoundError)
    if (error) return left(error)

    if (module === 3) {
      const classifiedBySUBFormula = classificationByCourseFormula['SUB'](studentsWithAverageOrError as StudentClassficationByPeriod[])
      const classified = classifiedBySUBFormula.filter(item => item.studentAverage.assessments.some(assessment => assessment.module === module))

      return right({ studentsWithAverage: classified, pages, totalItems })
    }

    const classifiedByCFPFormula = classificationByCourseFormula['CFP'](studentsWithAverageOrError as StudentClassficationByModule[])
    return right({ studentsWithAverage: classifiedByCFPFormula, pages, totalItems })
  }
}