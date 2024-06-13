import { getStudentAssessmentAverageStatus } from "./get-assessment-average-status.ts"

interface GenerateAssessmentAverageProps {
  vf: number
  avi: number
  avii: number
  vfe?: number | null
}

export function generateAssessmentAverage({ vf, avi, avii, vfe }: GenerateAssessmentAverageProps) {
  const average = [vf, avi, avii].filter(note => note !== 0)
  const assessmentAverage = average.reduce((previous, current) => previous + current) / average.length

  if (vfe) {
    const assessmentAverageWithVfe = (assessmentAverage + vfe + 10) / 4 
    const sumBetweenAssessmentAverageAndVfe = assessmentAverage + vfe

    const { status } = getStudentAssessmentAverageStatus({ average: sumBetweenAssessmentAverageAndVfe, isRecovering: true })

    return {
      vf,
      avi,
      avii,
      vfe,
      average: assessmentAverageWithVfe,
      status,
      isRecovering: true
    }
  }

  const { status } = getStudentAssessmentAverageStatus({ average: assessmentAverage, isRecovering: false })

  return {
    vf,
    avi,
    avii,
    vfe: null,
    average: assessmentAverage,
    status,
    isRecovering: false
  }
}