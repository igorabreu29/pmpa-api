import type { Classification } from "@/domain/boletim/enterprise/entities/classification.ts"
import { StudentClassficationByPeriod } from "../../types/generate-students-classification.js"

export const classifyStudentsByCFOFormula = (studentsWithAverage: Classification[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.generalAverage
    const geralAverageStudentB = studentB.generalAverage

    const isSecondSeasonInThirdModuleStudentA = studentA.assessments.filter(assessment => assessment.module === 3 && assessment.status !== 'approved')?.length
    const isSecondSeasonInThirdModuleStudentB = studentB.assessments.filter(assessment => assessment.module === 3 && assessment.status !== 'approved')?.length

    const totalAssessmentsApprovedInFirstModuleStudentA = studentA.assessments.filter(student => student.module === 1 && student.status === 'approved') 
    const totalAssessmentsApprovedInSecondModuleStudentA = studentA.assessments.filter(student => student.module === 2 && student.status === 'approved') 
    const totalAssessmentsApprovedInThirdModuleStudentA = studentA.assessments.filter(student => student.module === 3 && student.status === 'approved') 

    const totalAssessmentsApprovedInFirstModuleStudentB = studentB.assessments.filter(student => student.module === 1 && student.status === 'approved')
    const totalAssessmentsApprovedInSecondModuleStudentB = studentB.assessments.filter(student => student.module === 2 && student.status === 'approved') 
    const totalAssessmentsApprovedInThirdModuleStudentB = studentB.assessments.filter(student => student.module === 3 && student.status === 'approved') 

    const totalAssessmentsApprovedStudentA = 
    totalAssessmentsApprovedInFirstModuleStudentA?.length + totalAssessmentsApprovedInSecondModuleStudentA?.length + totalAssessmentsApprovedInThirdModuleStudentA?.length

    const totalAssessmentsApprovedStudentB = 
      totalAssessmentsApprovedInFirstModuleStudentB?.length + totalAssessmentsApprovedInSecondModuleStudentB?.length + totalAssessmentsApprovedInThirdModuleStudentB?.length

    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (!isSecondSeasonInThirdModuleStudentA && !isSecondSeasonInThirdModuleStudentB) {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (totalAssessmentsApprovedStudentA !== totalAssessmentsApprovedStudentB) {
        return totalAssessmentsApprovedStudentB - totalAssessmentsApprovedStudentA
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
      }
    }

    if (isSecondSeasonInThirdModuleStudentA && isSecondSeasonInThirdModuleStudentB) {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (totalAssessmentsApprovedStudentA !== totalAssessmentsApprovedStudentB) {
        return totalAssessmentsApprovedStudentB - totalAssessmentsApprovedStudentA
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
      }
    }

    return 0
  })
}

export const classifyStudentsByCHOFormula = (studentsWithAverage: Classification[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.generalAverage
    const geralAverageStudentB = studentB.generalAverage
    
    const isSecondSeasonStudentA = studentA.status !== 'approved'
    const isSecondSeasonStudentB = studentB.status !== 'approved'

    const totalQuantityApprovedInFirstSeasonStudentA = studentA.assessments.filter(assessment => assessment.status === 'approved').length
    const totalQuantityApprovedInFirstSeasonStudentB = studentB.assessments.filter(assessment => assessment.status === 'approved').length

    if (!isSecondSeasonStudentA && !isSecondSeasonStudentA)  {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (totalQuantityApprovedInFirstSeasonStudentA !== totalQuantityApprovedInFirstSeasonStudentB) {
        return totalQuantityApprovedInFirstSeasonStudentB - totalQuantityApprovedInFirstSeasonStudentA
      }
    }

    if (isSecondSeasonStudentA && isSecondSeasonStudentB) {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (totalQuantityApprovedInFirstSeasonStudentA !== totalQuantityApprovedInFirstSeasonStudentB) {
        return totalQuantityApprovedInFirstSeasonStudentB - totalQuantityApprovedInFirstSeasonStudentA
      }
    }

    return 0
  })
}

export const classifyStudentsByCFPFormula = (studentsWithAverage: Classification[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.generalAverage
    const geralAverageStudentB = studentB.generalAverage

    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    if (studentABirthday !== studentBBirthday) {
      return studentABirthday - studentBBirthday
    }

    return 0
  })
}

export const classifyStudentsByCGSAndCASFormula = (studentsWithAverage: Classification[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.generalAverage
    const geralAverageStudentB = studentB.generalAverage

    const studentAStatusAssessmentEqualApproved = studentA.assessments.filter(assessment => {
      return assessment.status === 'approved'
    })
    const studentBStatusAssessmentEqualApproved = studentB.assessments.filter(assessment => {
      return assessment.status === 'approved'
    })
    
    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    if (studentAStatusAssessmentEqualApproved?.length !== studentBStatusAssessmentEqualApproved?.length) {
      return studentBStatusAssessmentEqualApproved?.length - studentAStatusAssessmentEqualApproved?.length
    }

    if (studentABirthday !== studentBBirthday) {
      return studentABirthday - studentBBirthday
    }

    return 0
  })
}

export const classifyStudentsBySUBFormula = (studentsWithAverage: Classification[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.generalAverage
    const geralAverageStudentB = studentB.generalAverage

    const isSecondSeasonInFirstModuleStudentA = studentA.assessments
      .some(assessment => {
        return assessment.module === 1 && 
          assessment.status === 'approved second season' || 
          assessment.status === 'disapproved' || 
          assessment.status === 'second season'
      })
    const isSecondSeasonInFirstModuleStudentB = studentB.assessments
      .some(assessment => {
        return assessment.module === 1 && 
          assessment.status === 'approved second season' || 
          assessment.status === 'disapproved' || 
          assessment.status === 'second season'
      })

    const isSecondSeasonInSecondModuleStudentA = studentA.assessments
      .some(assessment => {
        return assessment.module === 2 && 
          assessment.status === 'approved second season' || 
          assessment.status === 'disapproved' || 
          assessment.status === 'second season'
      })

    const isSecondSeasonInSecondModuleStudentB = studentB.assessments
      .some(assessment => {
        return assessment.module === 2 && 
          assessment.status === 'approved second season' || 
          assessment.status === 'disapproved' || 
          assessment.status === 'second season'
      })

    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (isSecondSeasonInFirstModuleStudentB || isSecondSeasonInSecondModuleStudentB) {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentA) - Number(geralAverageStudentB)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
      }
    }

    if (isSecondSeasonInFirstModuleStudentA || isSecondSeasonInSecondModuleStudentA) {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentA) - Number(geralAverageStudentB)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentBBirthday - studentABirthday
      }
    }

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    if (studentABirthday !== studentBBirthday) {
      return studentABirthday - studentBBirthday
    }

    return 0
  })
}