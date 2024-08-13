import { formatCPF } from '@/core/utils/formatCPF.ts';
import excelToJSON from 'convert-excel-to-json';
import { resolve } from 'node:path';

export interface ExcelCreateStudentsBatch {
  [key: string]: {
    username: string
    cpf: number
    email: string
    civilId: number
    courseName: string
    poleName: string
    birthday: Date
  }[]
}

export interface ExcelUpdateStudentsBatch {
  [key: string]: {
    cpf: number
    username?: string
    email?: string
    civilId?: number
    birthday?: Date
    courseName: string
    poleName: string
  }[]
}

export interface ExcelAssessmentsBatch {
  [key: string]: {
    cpf: string
    disciplineName: string
    vf: number
    avi?: number
    avii?: number
    vfe?: number
  }[]
}

export interface ExcelBehaviorsBatch {
  [key: string]: {
    cpf: string
    january?: number
    february?: number
    march?: number
    april?: number
    may?: number
    jun?: number
    july?: number
    august?: number
    september?: number
    october?: number
    november?: number
    december?: number
  }[]
}

export function createStudentsBatchExcelToJSON(fileUrl: string) {
  const data: ExcelCreateStudentsBatch = excelToJSON({
    sourceFile: resolve(import.meta.dirname, `../../../../${fileUrl}`),
    header: {
      rows: 1
    },
    columnToKey: {
      A: 'cpf',
      B: 'username',
      C: 'email',
      D: 'civilId',
      E: 'birthday',
      F: 'courseName',
      G: 'poleName',
    },
  })

  const students = data['Página1'] ?? data['sheet1']

  return students.map(item => ({
    ...item,
    cpf: String(item.cpf)
  })) 
}

export function updateStudentsBatchExcelToJSON(fileUrl: string) {
  const data: ExcelUpdateStudentsBatch = excelToJSON({
    sourceFile: resolve(import.meta.dirname, `../../../../${fileUrl}`),
    header: {
      rows: 1
    },
    columnToKey: {
      A: 'cpf',
      B: 'username',
      C: 'email',
      D: 'civilId',
      E: 'birthday',
      F: 'courseName',
      G: 'poleName',
    },
  })

  const students = data['Página1'] ?? data['sheet1']

  return students.map(item => ({
    ...item,
    cpf: formatCPF(String(item.cpf))
  })) 
}

export function assessmentsBatchExcelToJSON(fileUrl: string) {
  const data: ExcelAssessmentsBatch = excelToJSON({
    sourceFile: resolve(import.meta.dirname, `../../../../${fileUrl}`),
    header: {
      rows: 1
    },
    columnToKey: {
      A: 'cpf',
      B: 'disciplineName',
      C: 'vf',
      D: 'avi',
      E: 'avii',
      F: 'vfe',
    },
  })

  const assessments = data['Página1'] ?? data['sheet1']

  return assessments.map(item => ({
    ...item,
    cpf: String(item.cpf)
  })) 
}

export function behaviorsBatchExcelToJSON(fileUrl: string) {
  const data: ExcelBehaviorsBatch = excelToJSON({
    sourceFile: resolve(import.meta.dirname, `../../../../${fileUrl}`),
    header: {
      rows: 1
    },
    columnToKey: {
      A: 'cpf',
      B: 'january',
      C: 'february',
      D: 'march',
      E: 'april',
      F: 'may',
      G: 'jun',
      H: 'july',
      I: 'august',
      J: 'september',
      K: 'october',
      L: 'november',
      M: 'december'
    },
  })

  const behaviors = data['Página1'] ?? data['sheet1']

  return behaviors.map(item => ({
    ...item,
    cpf: String(item.cpf)
  })) 
}

