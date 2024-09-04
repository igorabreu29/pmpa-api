import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import type { GenerateBehaviorStatus } from "../get-behavior-average-status.ts"

export interface StudentWithBehaviorAverage {
  behaviorAverage: {
    behaviorAverageStatus: GenerateBehaviorStatus
    behaviorsCount: number
  }
  studentName: string
  studentBirthday: Date
  studentCivilID: string
  studentPole: {
    id: UniqueEntityId
    name: string
  }
}

export interface BehaviorClassification {
  behaviorAverageByPole: {
    poleId: string
    name: string
    average: number
  }
}

export const ranksStudentsByBehaviorAverage = (behaviorsAverage: BehaviorClassification[]) => {
  return behaviorsAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.behaviorAverageByPole.average
    const geralAverageStudentB = studentB.behaviorAverageByPole.average

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    return 0
  })
}