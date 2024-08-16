import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import type { GenerateBehaviorStatus } from "../get-behavior-average-status.ts"

export interface BehaviorByModule {
  behaviorAverage: {
    behaviorAverageStatus: GenerateBehaviorStatus
    behaviorsCount: number
  }
  studentBirthday: Date
  studentCivilID: number
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

export const classifyStudentsByGradeBehaviorFormula = (behaviorsAverage: BehaviorClassification[]) => {
  return behaviorsAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.behaviorAverageByPole.average
    const geralAverageStudentB = studentB.behaviorAverageByPole.average

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    return 0
  })
}