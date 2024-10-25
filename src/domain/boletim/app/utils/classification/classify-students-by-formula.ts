import type { Classification } from "@/domain/boletim/enterprise/entities/classification.ts"
import { StudentClassficationByPeriod } from "../../types/generate-students-classification.js"

export const classifyStudentsByCFO2Formula = (studentsWithAverage: Classification[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.average
    const geralAverageStudentB = studentB.average

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

export const classifyStudentsByCFOFormula = (studentsWithAverage: Classification[]) => {
  const studentsApprovedInThirdModule = studentsWithAverage.filter(student => {
    return !student.assessments.some(item => item.module === 3 && item.status === 'approved second season' || item.status === 'second season')
  }).sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.average
    const geralAverageStudentB = studentB.average
    
    const isSecondSeasonStudentA = studentA.status !== 'approved'
    const isSecondSeasonStudentB = studentB.status !== 'approved'

    const totalQuantityApprovedInFirstSeasonStudentA = studentA.assessments.filter(assessment => assessment.status === 'approved').length
    const totalQuantityApprovedInFirstSeasonStudentB = studentB.assessments.filter(assessment => assessment.status === 'approved').length

    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (!isSecondSeasonStudentA && !isSecondSeasonStudentB)  {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
      }  

      if (totalQuantityApprovedInFirstSeasonStudentA !== totalQuantityApprovedInFirstSeasonStudentB) {
        return totalQuantityApprovedInFirstSeasonStudentB - totalQuantityApprovedInFirstSeasonStudentA
      }
    }

    if (isSecondSeasonStudentA && isSecondSeasonStudentB) {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
      }  

      if (totalQuantityApprovedInFirstSeasonStudentA !== totalQuantityApprovedInFirstSeasonStudentB) {
        return totalQuantityApprovedInFirstSeasonStudentB - totalQuantityApprovedInFirstSeasonStudentA
      }
    }

    return 0
  })

  const studentsDisapprovedInThirdModule = studentsWithAverage.filter(student => {
    return student.assessments.some(item => item.module === 3 && item.status === 'approved second season' || item.status === 'second season')
  }).sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.average
    const geralAverageStudentB = studentB.average
    
    const isSecondSeasonStudentA = studentA.status !== 'approved'
    const isSecondSeasonStudentB = studentB.status !== 'approved'

    const totalQuantityApprovedInFirstSeasonStudentA = studentA.assessments.filter(assessment => assessment.status === 'approved').length
    const totalQuantityApprovedInFirstSeasonStudentB = studentB.assessments.filter(assessment => assessment.status === 'approved').length

    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (!isSecondSeasonStudentA && !isSecondSeasonStudentB)  {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
      }

      if (totalQuantityApprovedInFirstSeasonStudentA !== totalQuantityApprovedInFirstSeasonStudentB) {
        return totalQuantityApprovedInFirstSeasonStudentB - totalQuantityApprovedInFirstSeasonStudentA
      }
    }

    if (isSecondSeasonStudentA && isSecondSeasonStudentB) {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
      }

      if (totalQuantityApprovedInFirstSeasonStudentA !== totalQuantityApprovedInFirstSeasonStudentB) {
        return totalQuantityApprovedInFirstSeasonStudentB - totalQuantityApprovedInFirstSeasonStudentA
      }
    }

    return 0
  })

  return [...studentsApprovedInThirdModule, ...studentsDisapprovedInThirdModule]
}

export const classifyStudentsByCHOFormula = (studentsWithAverage: Classification[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.average
    const geralAverageStudentB = studentB.average
    
    const isSecondSeasonStudentA = studentA.status !== 'approved'
    const isSecondSeasonStudentB = studentB.status !== 'approved'

    const totalQuantityApprovedInFirstSeasonStudentA = studentA.assessments.filter(assessment => assessment.status === 'approved').length
    const totalQuantityApprovedInFirstSeasonStudentB = studentB.assessments.filter(assessment => assessment.status === 'approved').length

    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (!isSecondSeasonStudentA && !isSecondSeasonStudentA)  {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
      }

      if (totalQuantityApprovedInFirstSeasonStudentA !== totalQuantityApprovedInFirstSeasonStudentB) {
        return totalQuantityApprovedInFirstSeasonStudentB - totalQuantityApprovedInFirstSeasonStudentA
      }
    }

    if (isSecondSeasonStudentA && isSecondSeasonStudentB) {
      if (geralAverageStudentA !== geralAverageStudentB) {
        return Number(geralAverageStudentB) - Number(geralAverageStudentA)
      }

      if (studentABirthday !== studentBBirthday) {
        return studentABirthday - studentBBirthday
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
    const geralAverageStudentA = studentA.average
    const geralAverageStudentB = studentB.average

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
    const geralAverageStudentA = studentA.average
    const geralAverageStudentB = studentB.average

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
  const approvedStudents = studentsWithAverage.filter(student => {
    const disapprovedStudentInFirstModule = student.assessments
      ?.some(assessment => {
        return assessment.module === 1 && 
          assessment.status === 'approved second season' || 
          assessment.status === 'second season'
      })

    const disapprovedStudentInSecondModule = student.assessments
      ?.some(assessment => {
        return assessment.module === 2 && 
          assessment.status === 'approved second season' || 
          assessment.status === 'second season'
    })

    return !disapprovedStudentInFirstModule && !disapprovedStudentInSecondModule
  }).sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.average
    const geralAverageStudentB = studentB.average

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

  const disapprovedStudents = studentsWithAverage.filter(student => {
    const disapprovedStudentInFirstModule = student.assessments
      ?.some(assessment => {
        return assessment.module === 1 && 
          assessment.status === 'approved second season' || 
          assessment.status === 'second season'
      })

    const disapprovedStudentInSecondModule = student.assessments
      ?.some(assessment => {
        return assessment.module === 2 && 
          assessment.status === 'approved second season' || 
          assessment.status === 'second season'
      })

    return disapprovedStudentInFirstModule || disapprovedStudentInSecondModule
  }).sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.average
    const geralAverageStudentB = studentB.average

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

  return [...approvedStudents, ...disapprovedStudents]
}