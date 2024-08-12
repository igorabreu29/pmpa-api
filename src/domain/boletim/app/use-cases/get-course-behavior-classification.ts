import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import { left, right, type Either } from "@/core/either.ts"
import type { BehaviorsRepository } from "../repositories/behaviors-repository.ts"
import { generateBehaviorAverage } from "../utils/generate-behavior-average.ts"
import { classifyStudentsByGradeBehaviorCGSAndCASFormula, classifyStudentsByGradeBehaviorCPFFormula, type CourseBehaviorClassificationByModule } from "../utils/classification/classify-students-by-grade-behavior.ts"
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts"

interface GetCourseBehaviorClassificationRequest {
  courseId: string
  page: number
}

type GetCourseBehaviorClassificationResponse = Either<ResourceNotFoundError, {
  studentsWithBehaviorAverage: CourseBehaviorClassificationByModule[]
}>

export class GetCourseBehaviorClassification {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({ courseId, page }: GetCourseBehaviorClassificationRequest): Promise<GetCourseBehaviorClassificationResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const { studentsCourse: students } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId, page, perPage: 30 })

    const behaviors = await Promise.all(students.map(async student => {
      const behaviors = await this.behaviorsRepository.findManyByStudentIdAndCourseId({ studentId: student.studentId.toValue(), courseId })
      const behaviorMonths = behaviors.map(({
        january,
        february,
        march,
        april,
        may,
        jun,
        july,
        august,
        september,
        october,
        november,
        december,
      }) => ({
        january,
        february,
        march,
        april,
        may,
        jun,
        july,
        august,
        september,
        october,
        november,
        december,
      }))
      
      const behaviorAverage = generateBehaviorAverage({ behaviorMonths, isPeriod: course.isPeriod })

      return {
        behaviorAverage,
        studentBirthday: student.birthday,
        studentCivilID: student.civilId,
        studentPole: student.pole
      }
    }))

    switch (course.formula) {
      case 'CGS': 
        const classifiedByCGSFormula = classifyStudentsByGradeBehaviorCGSAndCASFormula(behaviors as CourseBehaviorClassificationByModule[])
        return right({ studentsWithBehaviorAverage: classifiedByCGSFormula })
      case 'CAS': 
        const classifiedByCASFormula = classifyStudentsByGradeBehaviorCGSAndCASFormula(behaviors as CourseBehaviorClassificationByModule[])
        return right({ studentsWithBehaviorAverage: classifiedByCASFormula })
      case 'CFP': 
        const classifiedByCFPFormula = classifyStudentsByGradeBehaviorCPFFormula(behaviors as CourseBehaviorClassificationByModule[])
        return right({ studentsWithBehaviorAverage: classifiedByCFPFormula })
      default: 
        throw new InvalidCourseFormulaError(`This ${course.formula} does not exist.`)
    }
  }
}