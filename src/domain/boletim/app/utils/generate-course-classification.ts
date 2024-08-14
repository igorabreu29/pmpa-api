import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { classifyStudentsByCFOFormula, classifyStudentsByCFPFormula, classifyStudentsByCGSAndCASFormula, classifyStudentsByCHOFormula } from "./classification/classify-students-by-formula.ts";

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

  CHO: (studentsWithAverage: StudentClassficationByModule[]) => {
    return classifyStudentsByCHOFormula(studentsWithAverage)
  },

  CFO: (studentsWithAverage: StudentClassficationByPeriod[]) => {
    return classifyStudentsByCFOFormula(studentsWithAverage)
  },
} 
