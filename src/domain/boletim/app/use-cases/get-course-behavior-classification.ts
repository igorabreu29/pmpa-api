import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"
import { left, right } from "@/core/either.ts"
import type { BehaviorsRepository } from "../repositories/behaviors-repository.ts"
import { generateBehaviorAverage } from "../utils/generate-behavior-average.ts"
import type { GenerateBehaviorStatus } from "../utils/get-behavior-average-status.ts"
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts"

interface GetCourseBehaviorClassificationRequest {
  courseId: string
  page: number
}

export interface CourseBehaviorClassificationByModule {
  behaviorAverage: {
    behaviorAverageStatus: GenerateBehaviorStatus
    behaviorsCount: number
  }
  studentBirthday: Date
  studentCivilID: number
  studentPole: string
}

export interface CourseBehaviorClassificationByPeriod {
  behaviorAverage: {
    behaviorAverageStatus: GenerateBehaviorStatus[]
    behaviorsCount: number
  }
  studentBirthday: Date
  studentCivilID: number
  studentPole: string
}

export class GetCourseBehaviorClassification {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({ courseId, page }: GetCourseBehaviorClassificationRequest) {
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
        const classifiedByCGSFormula = classifyStudentsByCGSAndCASFormula(behaviors as CourseBehaviorClassificationByModule[])
        return right({ studentsWithBehaviorAverage: classifiedByCGSFormula })
      case 'CAS': 
        const classifiedByCASFormula = classifyStudentsByCGSAndCASFormula(behaviors as CourseBehaviorClassificationByModule[])
        return right({ studentsWithBehaviorAverage: classifiedByCASFormula })
      case 'CFP': 
        const classifiedByCFPFormula = classifyStudentsByCPFFormula(behaviors as CourseBehaviorClassificationByModule[])
        return right({ studentsWithBehaviorAverage: classifiedByCFPFormula })
      case 'CFO': 
        const classifiedByCFOFormula = classifyStudentsByPeriodFormula(behaviors as CourseBehaviorClassificationByPeriod[])
        return right({ studentsWithBehaviorAverage: classifiedByCFOFormula })
      case 'CHO': 
        const classifiedByCHOFormula = classifyStudentsByPeriodFormula(behaviors as CourseBehaviorClassificationByPeriod[])
        return right({ studentsWithBehaviorAverage: classifiedByCHOFormula })
      default: 
        return left(new InvalidCourseFormulaError(`This formula: ${course.formula} is invalid.`))
    }
  }
}

export const classifyStudentsByPeriodFormula = (behaviorsAverage: CourseBehaviorClassificationByPeriod[]) => {
  return behaviorsAverage.sort((studentA, studentB) => {
    const studentAIsRecoveringInTheThirdModule = studentA.behaviorAverage?.behaviorAverageStatus?.some(behavior => behavior.status === 'approved')
    const studentBIsRecoveringInTheThirdModule = studentB.behaviorAverage?.behaviorAverageStatus?.some(behavior => behavior.status === 'approved')

    const geralAverageStudentA = studentA.behaviorAverage.behaviorAverageStatus?.reduce((acc, behavior) => acc + behavior.behaviorAverage , 0)
    const geralAverageStudentB = studentB.behaviorAverage.behaviorAverageStatus?.reduce((acc, behavior) => acc + behavior.behaviorAverage, 0)

    const totalFromStudentAThatIsRecovering = studentA.behaviorAverage.behaviorAverageStatus?.filter(student => student.behaviorAverage < 7)

    const totalFromStudentBThatIsRecovering = studentB.behaviorAverage.behaviorAverageStatus?.filter(student => student.behaviorAverage < 7)

    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (!studentAIsRecoveringInTheThirdModule && !studentBIsRecoveringInTheThirdModule) {
      if (geralAverageStudentA < geralAverageStudentB) return 1
      if (geralAverageStudentA > geralAverageStudentB) return -1
      if (totalFromStudentAThatIsRecovering < totalFromStudentBThatIsRecovering) return 1
      if (totalFromStudentAThatIsRecovering > totalFromStudentBThatIsRecovering) return -1
      if (studentABirthday < studentBBirthday) return 1
      if (studentABirthday > studentBBirthday) return -1
    }

    if (geralAverageStudentA < geralAverageStudentB) return 1
    if (geralAverageStudentA > geralAverageStudentB) return -1
    if (totalFromStudentAThatIsRecovering < totalFromStudentBThatIsRecovering) return -1
    if (totalFromStudentAThatIsRecovering > totalFromStudentBThatIsRecovering) return 1
    if (studentABirthday < studentBBirthday) return -1
    if (studentABirthday > studentBBirthday) return 1

    return 0
  })
}

export const classifyStudentsByCGSAndCASFormula = (behaviorsAverage: CourseBehaviorClassificationByModule[]) => {
  return behaviorsAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.behaviorAverage.behaviorAverageStatus.behaviorAverage
    const geralAverageStudentB = studentB.behaviorAverage.behaviorAverageStatus.behaviorAverage

    const isApprovedStudentA = studentA.behaviorAverage.behaviorAverageStatus.status === 'approved'
    const isApprovedStudentB = studentB.behaviorAverage.behaviorAverageStatus.status === 'approved'
    
    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    if (isApprovedStudentA !== isApprovedStudentB) {
      return Number(isApprovedStudentB) - Number(isApprovedStudentB)
    }

    if (studentABirthday !== studentBBirthday) {
      return studentABirthday - studentBBirthday
    }

    return 0
  })
}

export const classifyStudentsByCPFFormula = (behaviorsAverage: CourseBehaviorClassificationByModule[]) => {
  return behaviorsAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.behaviorAverage.behaviorAverageStatus.behaviorAverage
    const geralAverageStudentB = studentB.behaviorAverage.behaviorAverageStatus.behaviorAverage
    
    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    if (studentABirthday !== studentBBirthday) {
      return studentABirthday - studentBBirthday
    }

    return 0
  })
}