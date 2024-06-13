import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";

export const classifyStudentsByPeriodFormule = (studentsWithAverage: StudentClassficationByPeriod[]) => {
    return studentsWithAverage.sort((studentA, studentB) => {
      const studentAIsRecoveringInTheThirdModule = studentA.studentAverage.assessments['module3'].some(student => student.isRecovering)
      const studentBIsRecoveringInTheThirdModule = studentB.studentAverage.assessments['module3'].some(student => student.isRecovering)

      const geralAverageStudentA = studentA.studentAverage.averageInform.geralAverage
      const geralAverageStudentB = studentB.studentAverage.averageInform.geralAverage

      const totalFromStudentAThatIsRecoveringInModule1 = studentA.studentAverage.assessments['module1'].filter(student => student.isRecovering) 
      const totalFromStudentAThatIsRecoveringInModule2 = studentA.studentAverage.assessments['module2'].filter(student => student.isRecovering) 
      const totalFromStudentAThatIsRecoveringInModule3 = studentA.studentAverage.assessments['module3'].filter(student => student.isRecovering) 

      const totalFromStudentBThatIsRecoveringInModule1 = studentB.studentAverage.assessments['module1'].filter(student => student.isRecovering) 
      const totalFromStudentBThatIsRecoveringInModule2 = studentB.studentAverage.assessments['module2'].filter(student => student.isRecovering) 
      const totalFromStudentBThatIsRecoveringInModule3 = studentB.studentAverage.assessments['module3'].filter(student => student.isRecovering) 

      const totalRecoveringFromStudentA = 
        totalFromStudentAThatIsRecoveringInModule1.length + totalFromStudentAThatIsRecoveringInModule2.length + totalFromStudentAThatIsRecoveringInModule3.length

      const totalRecoveringFromStudentB = 
        totalFromStudentBThatIsRecoveringInModule1.length + totalFromStudentBThatIsRecoveringInModule2.length + totalFromStudentBThatIsRecoveringInModule3.length

      const studentABirthday = Number(studentA.studentBirthday?.getTime())
      const studentBBirthday = Number(studentB.studentBirthday?.getTime())

      if (!studentAIsRecoveringInTheThirdModule && !studentBIsRecoveringInTheThirdModule) {
        if (geralAverageStudentA < geralAverageStudentB) return 1
        if (geralAverageStudentA > geralAverageStudentB) return -1
        if (totalRecoveringFromStudentA < totalRecoveringFromStudentB) return 1
        if (totalRecoveringFromStudentA > totalRecoveringFromStudentB) return -1
        if (studentABirthday < studentBBirthday) return 1
        if (studentABirthday > studentBBirthday) return -1
      }

      if (geralAverageStudentA < geralAverageStudentB) return 1
      if (geralAverageStudentA > geralAverageStudentB) return -1
      if (totalRecoveringFromStudentA < totalRecoveringFromStudentB) return -1
      if (totalRecoveringFromStudentA > totalRecoveringFromStudentB) return 1
      if (studentABirthday < studentBBirthday) return -1
      if (studentABirthday > studentBBirthday) return 1

      return 0
    })
}

export const classifyStudentsByModuleFormule = (studentsWithAverage: StudentClassficationByModule[]) => {
  return studentsWithAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.studentAverage.averageInform.geralAverage
    const geralAverageStudentB = studentB.studentAverage.averageInform.geralAverage

    const studentABirthday = Number(studentA.studentBirthday?.getTime())
    const studentBBirthday = Number(studentB.studentBirthday?.getTime())

    if (geralAverageStudentA < geralAverageStudentB) return 1
    if (geralAverageStudentA > geralAverageStudentB) return -1

    if (studentABirthday < studentBBirthday) return -1
    if (studentABirthday > studentBBirthday) return 1

    return 0
  })
}