import { getStudentAssessmentAverageStatus, type Status } from "./get-assessment-average-status.ts"

interface GenerateAssessmentAverageProps {
  vf: number
  avi: number
  avii: number
  vfe: number | null
}

export interface GenerateAssessmentAverageResponse {
  vf: number
  avi: number | null
  avii: number | null
  vfe: number | null
  average: number
  status: Status
  isRecovering: boolean
}

export function generateAssessmentAverage({ vf, avi, avii, vfe }: GenerateAssessmentAverageProps): GenerateAssessmentAverageResponse {
  const assessments = [vf, avi, avii].filter(note => note >= 0)
  const assessmentAverage = assessments.reduce((previousNote, currentNote) => previousNote + currentNote, 0) / assessments.length

  if (vfe) {
    const assessmentAverageWithVfe = (assessmentAverage + vfe + 10) / 4 
    const sumBetweenAssessmentAverageAndVfe = assessmentAverage + vfe

    const { status } = getStudentAssessmentAverageStatus({ average: sumBetweenAssessmentAverageAndVfe, isRecovering: true })

    return {
      vf,
      avi: avi >= 0 ? avi : null,
      avii: avii >= 0 ? avii : null,
      vfe,
      average: assessmentAverageWithVfe,
      status,
      isRecovering: true
    }
  }

  const { status } = getStudentAssessmentAverageStatus({ average: assessmentAverage, isRecovering: false })

  return {
    vf,
    avi: avi >= 0 ? avi : null,
    avii: avii >= 0 ? avii : null,
    vfe: null,
    average: assessmentAverage,
    status,
    isRecovering: false
  }
}