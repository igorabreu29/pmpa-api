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
  page: number
}

type GetCourseClassificationUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  studentsWithAverage: StudentClassficationByPeriod[] | StudentClassficationByModule[]
}>

export class GetCourseClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
  ) {}

  async execute({ courseId, page }: GetCourseClassificationUseCaseRequest): Promise<GetCourseClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const { studentsCourse: students } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId, page, perPage: 30 })

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod
      })

      if (studentAverage.isLeft()) return studentAverage.value
      
      return {
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentCivilID: student.civilId,
        studentPole: student.pole
      }
    }))


    const error = studentsWithAverageOrError.find(item => item instanceof ResourceNotFoundError)
    if (error) return left(error)

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