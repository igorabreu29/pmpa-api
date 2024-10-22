interface GetGeralStudentAverageStatusProps {
  average: number
  isRecovering: boolean
  conceptType?: 1 | 2
}

export type Concept = 'excellent' 
  | 'very good' 
  | 'good' 
  | 'regular' 
  | 'insufficient' 
  | 'no income'

export type StudentStatus = 
  | 'approved' 
  | 'disapproved' 
  | 'approved second season' 
  | 'disapproved second season'
  | 'second season'

export interface GetGeralStudentAverageStatusResponse {
  concept: Concept
  status: StudentStatus
}

export function getGeralStudentAverageStatus({ average, isRecovering, conceptType = 1 }: GetGeralStudentAverageStatusProps): GetGeralStudentAverageStatusResponse {
  const concepts = {
    1: ({ average, isRecovering }: GetGeralStudentAverageStatusProps): GetGeralStudentAverageStatusResponse => {
      if (isRecovering) {
        if (average === 10) return { concept: 'excellent', status: 'approved second season' }
        if (average >= 8 && average < 10) return { concept: 'very good', status: 'approved second season' }
        if (average >= 7 && average < 8) return { concept: 'good', status: 'approved second season' }
        if (average >= 5 && average < 7) return { concept: 'regular', status: 'approved second season' }
        if (average > 0 && average < 5) return { concept: 'insufficient', status: 'disapproved second season' } 
        if (average === 0) return { concept: 'no income', status: 'disapproved' } 
      }
    
      if (average === 10) return { concept: 'excellent', status: 'approved' }
      if (average >= 8 && average < 10) return { concept: 'very good', status: 'approved' }
      if (average >= 7 && average < 8) return { concept: 'good', status: 'approved' }
      if (average >= 5 && average < 7) return { concept: 'regular', status: 'approved' }
      if (average > 0 && average < 5) return { concept: 'insufficient', status: 'disapproved' } 
    
      return {
        concept: 'no income',
        status: 'disapproved'
      }
    },

    2: ({ average, isRecovering }: GetGeralStudentAverageStatusProps): GetGeralStudentAverageStatusResponse => {
      if (isRecovering) {
        if (average >= 9.5 && average <= 10) return { concept: 'excellent', status: 'approved' }
        if (average >= 8.5 && average < 9.5) return { concept: 'very good', status: 'approved' }
        if (average >= 7.5 && average < 8.5) return { concept: 'good', status: 'approved' }
        if (average >= 7 && average < 7.5) return { concept: 'regular', status: 'approved' }
        if (average > 0 && average < 7) return { concept: 'insufficient', status: 'disapproved' } 
        if (average === 0) return { concept: 'no income', status: 'disapproved' } 
      }
    
      if (average >= 9.5 && average <= 10) return { concept: 'excellent', status: 'approved' }
      if (average >= 8.5 && average < 9.5) return { concept: 'very good', status: 'approved' }
      if (average >= 7.5 && average < 8.5) return { concept: 'good', status: 'approved' }
      if (average >= 7 && average < 7.5) return { concept: 'regular', status: 'approved' }
      if (average > 0 && average < 7) return { concept: 'insufficient', status: 'disapproved' } 
    
      return {
        concept: 'no income',
        status: 'disapproved'
      }
    }
  }

  return concepts[conceptType]({ average, isRecovering })
}