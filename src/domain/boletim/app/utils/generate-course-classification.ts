import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { classifyStudentsByCFOFormula, classifyStudentsByCFPFormula, classifyStudentsByCGSAndCASFormula, classifyStudentsByCHOFormula, classifyStudentsBySUBFormula } from "./classification/classify-students-by-formula.ts";

export const classificationByCourseFormula = {
  CGS: (studentsWithAverage: StudentClassficationByModule[]) => {
    return classifyStudentsByCGSAndCASFormula(studentsWithAverage)
  },

  CAS: (studentsWithAverage: StudentClassficationByModule[]) => {
    return classifyStudentsByCGSAndCASFormula(studentsWithAverage)
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

  SUB: (studentsWithAverage: StudentClassficationByPeriod[]) => {
    return classifyStudentsBySUBFormula(studentsWithAverage)
  },
} 
