interface CalculatesAverageWithWeightProps {  
  assessmentsQuantityPerPeriod: number
  assessmentAverage: number
  behaviorAveragePerPeriod: number
  weight: number
}

export const calculatesAverageWithWeight = ({
  assessmentsQuantityPerPeriod,
  assessmentAverage,
  behaviorAveragePerPeriod,
  weight
}: CalculatesAverageWithWeightProps) => {
  return behaviorAveragePerPeriod 
    ? (assessmentAverage + behaviorAveragePerPeriod ) / (assessmentsQuantityPerPeriod + 1) * weight
    : assessmentAverage / assessmentsQuantityPerPeriod * weight
}