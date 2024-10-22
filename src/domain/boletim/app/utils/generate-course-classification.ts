import type { Classification } from "../../enterprise/entities/classification.ts";
import { StudentClassficationByModule, StudentClassficationByPeriod } from "../types/generate-students-classification.js";
import { classifyStudentsByCFOFormula, classifyStudentsByCFPFormula, classifyStudentsByCGSAndCASFormula, classifyStudentsByCHOFormula, classifyStudentsBySUBFormula } from "./classification/classify-students-by-formula.ts";

export const classificationByCourseFormula = {
  CGS: (studentsWithAverage: Classification[]) => {
    return classifyStudentsByCGSAndCASFormula(studentsWithAverage)
  },

  CAS: (studentsWithAverage: Classification[]) => {
    return classifyStudentsByCGSAndCASFormula(studentsWithAverage)
  },

  CFP: (studentsWithAverage: Classification[]) => {
    return classifyStudentsByCFPFormula(studentsWithAverage)
  },

  CHO: (studentsWithAverage: Classification[]) => {
    return classifyStudentsByCHOFormula(studentsWithAverage)
  },

  CFO: (studentsWithAverage: Classification[]) => {
    return classifyStudentsByCFOFormula(studentsWithAverage)
  },

  'CFO 2': (studentsWithAverage: Classification[]) => {
    return classifyStudentsByCFOFormula(studentsWithAverage)
  },
  
  SUB: (studentsWithAverage: Classification[]) => {
    return classifyStudentsBySUBFormula(studentsWithAverage)
  },
} 
