import type { GenerateBehaviorStatus } from "../get-behavior-average-status.ts"

export interface CourseBehaviorClassificationByModule {
  behaviorAverage: {
    behaviorAverageStatus: GenerateBehaviorStatus
    behaviorsCount: number
  }
  studentBirthday: Date
  studentCivilID: number
  studentPole: string
}

export const classifyStudentsByGradeBehaviorCGSAndCASFormula = (behaviorsAverage: CourseBehaviorClassificationByModule[]) => {
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

export const classifyStudentsByGradeBehaviorCPFFormula = (behaviorsAverage: CourseBehaviorClassificationByModule[]) => {
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