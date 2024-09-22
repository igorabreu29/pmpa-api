import { StudentClassficationByModule, StudentClassficationByPeriod } from "../../types/generate-students-classification.js"

export const classifyStudentsByCFOFormula = (studentsWithAverage: StudentClassficationByPeriod[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.studentAverage.averageInform.geralAverage
    const geralAverageStudentB = studentB.studentAverage.averageInform.geralAverage

    const isSecondSeasonInThirdModuleStudentA = studentA.studentAverage.assessmentsPerPeriod['module3']?.filter(assessment => assessment.status !== 'approved')?.length
    const isSecondSeasonInThirdModuleStudentB = studentB.studentAverage.assessmentsPerPeriod['module3']?.filter(assessment => assessment.status !== 'approved')?.length

    const totalAssessmentsApprovedInFirstModuleStudentA = studentA.studentAverage.assessmentsPerPeriod['module1']?.filter(student => student.status === 'approved') 
    const totalAssessmentsApprovedInSecondModuleStudentA = studentA.studentAverage.assessmentsPerPeriod['module2']?.filter(student => student.status === 'approved') 
    const totalAssessmentsApprovedInThirdModuleStudentA = studentA.studentAverage.assessmentsPerPeriod['module3']?.filter(student => student.status === 'approved') 

    const totalAssessmentsApprovedInFirstModuleStudentB = studentB.studentAverage.assessmentsPerPeriod['module1']?.filter(student => student.status === 'approved') 
    const totalAssessmentsApprovedInSecondModuleStudentB = studentB.studentAverage.assessmentsPerPeriod['module2']?.filter(student => student.status === 'approved') 
    const totalAssessmentsApprovedInThirdModuleStudentB = studentB.studentAverage.assessmentsPerPeriod['module3']?.filter(student => student.status === 'approved') 

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

export const classifyStudentsByCHOFormula = (studentsWithAverage: StudentClassficationByModule[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.studentAverage.averageInform.geralAverage
    const geralAverageStudentB = studentB.studentAverage.averageInform.geralAverage
    
    const isSecondSeasonStudentA = studentA.studentAverage.averageInform.studentAverageStatus.status !== 'approved'
    const isSecondSeasonStudentB = studentB.studentAverage.averageInform.studentAverageStatus.status !== 'approved'

    const totalQuantityApprovedInFirstSeasonStudentA = studentA.studentAverage.assessments.filter(assessment => assessment.status === 'approved').length
    const totalQuantityApprovedInFirstSeasonStudentB = studentB.studentAverage.assessments.filter(assessment => assessment.status === 'approved').length

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

export const classifyStudentsByCFPFormula = (studentsWithAverage: StudentClassficationByModule[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.studentAverage.averageInform.geralAverage
    const geralAverageStudentB = studentB.studentAverage.averageInform.geralAverage

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

export const classifyStudentsByCGSAndCASFormula = (studentsWithAverage: StudentClassficationByModule[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.studentAverage.averageInform.geralAverage
    const geralAverageStudentB = studentB.studentAverage.averageInform.geralAverage

    const studentAStatusAssessmentEqualApproved = studentA.studentAverage.assessments.filter(assessment => {
      return assessment.status === 'approved'
    })
    const studentBStatusAssessmentEqualApproved = studentB.studentAverage.assessments.filter(assessment => {
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

export const classifyStudentsBySUBFormula = (studentsWithAverage: StudentClassficationByPeriod[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.studentAverage.averageInform.geralAverage
    const geralAverageStudentB = studentB.studentAverage.averageInform.geralAverage

    const isSecondSeasonInFirstModuleStudentA = studentA.studentAverage.assessmentsPerPeriod['module1']
     ?.some(assessment => assessment.status === 'approved second season' || assessment.status === 'disapproved' || assessment.status === 'second season')
    const isSecondSeasonInFirstModuleStudentB = studentA.studentAverage.assessmentsPerPeriod['module1']
     ?.some(assessment => assessment.status === 'approved second season' || assessment.status === 'disapproved' || assessment.status === 'second season')

    const isSecondSeasonInSecondModuleStudentA = studentA.studentAverage.assessmentsPerPeriod['module2']
     ?.some(assessment => assessment.status === 'approved second season' || assessment.status === 'disapproved' || assessment.status === 'second season')

    const isSecondSeasonInSecondModuleStudentB = studentA.studentAverage.assessmentsPerPeriod['module2']
     ?.some(assessment => assessment.status === 'approved second season' || assessment.status === 'disapproved' || assessment.status === 'second season')

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
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
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