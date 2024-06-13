export interface GetStudentAssessmentAverageStatusProps {
  average: number
  isRecovering: boolean
}

export type Status = 'approved' | 'disapproved' | 'approved second season' | 'second season'

export interface GetStudentAssessmentAverageStatusResponse {
  status: Status
}

export function getStudentAssessmentAverageStatus({ average, isRecovering }: GetStudentAssessmentAverageStatusProps): GetStudentAssessmentAverageStatusResponse {
  if (isRecovering) return average >= 10 ? { status: 'approved second season' } : { status: 'disapproved' }
  
  return average >= 7 && average <= 10 ? { status: 'approved' } : { status: 'second season' }
}