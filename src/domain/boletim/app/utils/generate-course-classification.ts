import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { classifyStudentsByCFPFormula, classifyStudentsByCGSAndCASFormula, classifyStudentsByPeriodFormula } from "./classification/classify-students-by-formula.ts";

export const classificationByCourseFormula = {
  CGS: (studentsWithAverage: StudentClassficationByModule[]) => {
    return classifyStudentsByCGSAndCASFormula(studentsWithAverage)
  },

  CAS: (studentsWithAverage: StudentClassficationByModule[]) => {
    return classifyStudentsByCFPFormula(studentsWithAverage)
  },

  CFP: (studentsWithAverage: StudentClassficationByModule[]) => {
    return classifyStudentsByCFPFormula(studentsWithAverage)
  },

  CFO: (studentsWithAverage: StudentClassficationByPeriod[]) => {
    return classifyStudentsByPeriodFormula(studentsWithAverage)
  },

  CHO: (studentsWithAverage: StudentClassficationByPeriod[]) => {
    return classifyStudentsByPeriodFormula(studentsWithAverage)
  },
} 
