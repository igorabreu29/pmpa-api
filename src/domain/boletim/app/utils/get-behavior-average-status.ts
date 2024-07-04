export interface GenerateBehaviorStatus {
  behaviorAverage: number
  status: 'disapproved' | 'approved'
}

export function getBehaviorAverageStatus(behaviorAverage: number): GenerateBehaviorStatus  {
  if(behaviorAverage >= 6 && behaviorAverage <= 10) {
    return {
      behaviorAverage,
      status: 'approved'
    }
  }

  return {
    behaviorAverage, 
    status: 'disapproved'
 }
}