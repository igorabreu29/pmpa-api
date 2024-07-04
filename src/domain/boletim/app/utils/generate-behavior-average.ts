import { Formule } from "@/domain/boletim/enterprise/entities/course.ts";
import { formuleType } from "./get-behavior-average-by-course-formule.ts";

export interface BehaviorMonths {
  january?: number | null
  february?: number | null
  march?: number | null
  april?: number | null
  may?: number | null
  jun?: number | null
  july?: number | null
  august?: number | null
  september?: number | null
  october?: number | null
  november?: number | null
  december?: number | null
}

export interface GenerateBehaviorAverageProps {
  behaviorMonths: BehaviorMonths[]
  formule: Formule
}

export function generateBehaviorAverage({ behaviorMonths, formule }: GenerateBehaviorAverageProps) {
  const behaviorMonthsNotes: (number | null)[] = []

  for (const behaviorMonth of behaviorMonths) {
    const { ...months } = behaviorMonth
    const notes = Object.values(months).filter(item => item !== null && item !== undefined)
    
    behaviorMonthsNotes.push(...notes)
  }

  if (formule === 'module') {
    return formuleType['module']({ behaviorMonthsNotes })
  }

  return formuleType['period']({ behaviorMonthsNotes })
}