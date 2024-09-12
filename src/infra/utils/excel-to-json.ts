import { formatCPF } from '@/core/utils/formatCPF.ts';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { readFile, utils } from '../libs/xlsx.ts'

export interface ExcelCreateStudentsBatch {
  CPF: number
  'NOME COMPLETO': string
  'E-MAIL': string
  'RG CIVIL': number
  'DATA DE NASCIMENTO': Date
  CURSO: string
  POLO: string
}

export interface ExcelUpdateStudentsBatch {
  CPF: number
  'NOME COMPLETO'?: string
  'E-MAIL'?: string
  'RG CIVIL'?: number
  'DATA DE NASCIMENTO'?: Date
  CURSO: string
  POLO: string
}

export interface ExcelAssessmentsBatch {
  CPF: string
  DISCIPLINA: string
  VF: number
  AVI?: number
  AVII?: number
  VFE?: number
}

export interface ExcelBehaviorsBatch {
  CPF: string
  JANEIRO?: number
  FEVEREIRO?: number
  MARÇO?: number
  ABRIL?: number
  MAIO?: number
  JUNHO?: number
  JULHO?: number
  AGOSTO?: number
  SETEMBRO?: number
  OUTUBRO?: number
  NOVEMBRO?: number
  DEZEMBRO?: number
  ANO: number
}

export function createStudentsBatchExcelToJSON(fileUrl: string) {
  const workbook = readFile(join(cwd(), fileUrl))
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  const students: ExcelCreateStudentsBatch[] = utils.sheet_to_json(worksheet)

  return students.map(student => ({
    cpf: formatCPF(String(student['CPF'])),
    username: student['NOME COMPLETO'],
    email: student['E-MAIL'],
    civilId: String(student['RG CIVIL']),
    birthday: new Date(student['DATA DE NASCIMENTO']),
    courseName: student['CURSO'],
    poleName: student['POLO'],
  }))
}

export function updateStudentsBatchExcelToJSON(fileUrl: string) {
  const workbook = readFile(join(cwd(), fileUrl))
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  const students: ExcelUpdateStudentsBatch[] = utils.sheet_to_json(worksheet)

  return students.map(student => ({
    cpf: String(student['CPF']),
    username: student['NOME COMPLETO'],
    email: student['E-MAIL'],
    civilId: String(student['RG CIVIL']),
    birthday: student['DATA DE NASCIMENTO'] ? new Date(student['DATA DE NASCIMENTO']) :  undefined,
    courseName: student['CURSO'],
    poleName: student['POLO'],
  }))
}

export function assessmentsBatchExcelToJSON(fileUrl: string) {
  const workbook = readFile(join(cwd(), fileUrl))
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  const assessments: ExcelAssessmentsBatch[] = utils.sheet_to_json(worksheet)

  return assessments.map(assessment => ({
    cpf: String(assessment['CPF']),
    disciplineName: assessment['DISCIPLINA'],
    vf: assessment['VF'],
    avi: assessment['AVI'],
    avii: assessment['AVII'],
    vfe: assessment['VFE'],
  }))
}

export function behaviorsBatchExcelToJSON(fileUrl: string) {
  const workbook = readFile(join(cwd(), fileUrl))
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  const behaviors: ExcelBehaviorsBatch[] = utils.sheet_to_json(worksheet)

  return behaviors.map(behavior => ({
    cpf: String(behavior['CPF']),
    january: behavior['JANEIRO'],
    february: behavior['FEVEREIRO'],
    march: behavior['MARÇO'],
    april: behavior['ABRIL'],
    may: behavior['MAIO'],
    jun: behavior['JULHO'],
    july: behavior['JULHO'],
    august: behavior['AGOSTO'],
    september: behavior['SETEMBRO'],
    october: behavior['OUTUBRO'],
    november: behavior['NOVEMBRO'],
    december: behavior['DEZEMBRO'],
    currentYear: behavior['ANO']
  }))
}

