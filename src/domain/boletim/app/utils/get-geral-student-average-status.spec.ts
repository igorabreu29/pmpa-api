import { describe, expect, it } from 'vitest'
import { getGeralStudentAverageStatus } from './get-geral-student-average-status.ts'

describe('Geral Student Average Status', () => {
  describe('Student is recovering', () => {
    it ('should be able to receive concept "excellent" and status "approved second season" if the student is recovering and the average is equal 10', () => {
      const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 10, isRecovering: true })
  
      expect(geralStudentAverageStatus.status).toEqual('approved second season')
      expect(geralStudentAverageStatus.concept).toEqual('excellent')
    })
  
    it (
      'should be able to receive concept "very goodapproved second season" and status "approved second season" if the student is recovering and the average is greater than or equal 8 and less than 10', 
      () => {
        const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 8, isRecovering: true })
  
        expect(geralStudentAverageStatus.status).toEqual('approved second season')
        expect(geralStudentAverageStatus.concept).toEqual('very good')
      }
    )
    
    it (
      'should be able to receive concept "good" and status "approved second season" if the student is recovering and the average is greater than or equal 7 and less than 8', 
      () => {
        const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 7.5, isRecovering: true })
  
        expect(geralStudentAverageStatus.status).toEqual('approved second season')
        expect(geralStudentAverageStatus.concept).toEqual('good')
      }
    )
  
    it (
      'should be able to receive concept "regular" and status "approved second season" if the student is recovering and the average is greater than or equal 5 and less than 7', 
      () => {
        const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 5, isRecovering: true })
  
        expect(geralStudentAverageStatus.status).toEqual('approved second season')
        expect(geralStudentAverageStatus.concept).toEqual('regular')
      }
    )
  
    it (
      'should be able to receive concept "insufficient" and status "disapproved second season" if the student is recovering and the average is greater than 0 and less than 5', 
      () => {
        const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 4, isRecovering: true })
  
        expect(geralStudentAverageStatus.status).toEqual('disapproved second season')
        expect(geralStudentAverageStatus.concept).toEqual('insufficient')
      }
    )
    
    it (
      'should be able to receive concept "no income" and status "disapproved" if the student is recovering and the average is equal 0', 
      () => {
        const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 0, isRecovering: true })
  
        expect(geralStudentAverageStatus.status).toEqual('disapproved')
        expect(geralStudentAverageStatus.concept).toEqual('no income')
      }
    )
  })

  describe('Student is not recovering', () => {
    it ('should be able to receive concept "excellent" and status "approved" if the student is not recovering and the average is equal 10', () => {
      const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 10, isRecovering: false })
  
      expect(geralStudentAverageStatus.status).toEqual('approved')
      expect(geralStudentAverageStatus.concept).toEqual('excellent')
    })
    
    it ('should be able to receive concept "very good" and status "approved" if the student is not recovering and the average is greater than or equal 8 and less than 10', () => {
      const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 8, isRecovering: false })
  
      expect(geralStudentAverageStatus.concept).toEqual('very good')
      expect(geralStudentAverageStatus.status).toEqual('approved')
    })

    it ('should be able to receive concept "good" and status "approved" if the student is not recovering and the average is greater than or equal 7 and less than 8', () => {
      const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 7, isRecovering: false })
  
      expect(geralStudentAverageStatus.concept).toEqual('good')
      expect(geralStudentAverageStatus.status).toEqual('approved')
    })

    it ('should be able to receive concept "regular" and status "approved" if the student is not recovering and the average is greater than or equal 5 and less than 7', () => {
      const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 5, isRecovering: false })
  
      expect(geralStudentAverageStatus.concept).toEqual('regular')
      expect(geralStudentAverageStatus.status).toEqual('approved')
    })
    
    it ('should be able to receive concept "insufficient" and status "disapproved" if the student is not recovering and the average is greater than 0 and less than 5', () => {
      const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 1, isRecovering: false })
  
      expect(geralStudentAverageStatus.concept).toEqual('insufficient')
      expect(geralStudentAverageStatus.status).toEqual('disapproved')
    })

    it ('should be able to receive concept "no income" and status "disapproved" if the student is not recovering and the average is equal 0', () => {
      const geralStudentAverageStatus = getGeralStudentAverageStatus({ average: 0, isRecovering: false })
  
      expect(geralStudentAverageStatus.concept).toEqual('no income')
      expect(geralStudentAverageStatus.status).toEqual('disapproved')
    })
  })
})