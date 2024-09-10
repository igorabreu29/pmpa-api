import { formatCPF } from '@/core/utils/formatCPF.ts';
<<<<<<< HEAD
import xlsx from 'xlsx';
import { resolve } from 'node:path';
import { cwd } from 'node:process'
import fileSystem from 'node:fs'
=======
import { join } from 'node:path';
import { cwd } from 'node:process';
import { readFile, utils } from '../libs/xlsx.ts'
>>>>>>> 475cc375b3f2ea5b2df4391ba52c8f454b9494a4

export interface ExcelCreateStudentsBatch {
  CPF: number
  'NOME COMPLETO': string
  'E-MAIL': string
  'RG CIVIL': number
  'DATA DE NASCIMENTO': Date
<<<<<<< HEAD
  'CURSO': string
  'POLO': string
=======
  CURSO: string
  POLO: string
>>>>>>> 475cc375b3f2ea5b2df4391ba52c8f454b9494a4
}

export interface ExcelUpdateStudentsBatch {
  CPF: number
  'NOME COMPLETO'?: string
  'E-MAIL'?: string
  'RG CIVIL'?: number
  'DATA DE NASCIMENTO'?: Date
<<<<<<< HEAD
  'CURSO'?: string
  'POLO'?: string
=======
  CURSO: string
  POLO: string
>>>>>>> 475cc375b3f2ea5b2df4391ba52c8f454b9494a4
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
}

export function createStudentsBatchExcelToJSON(fileUrl: string) {
<<<<<<< HEAD
  const workbook = xlsx.readFile(resolve(cwd(), fileUrl))

  const sheets = workbook.SheetNames
  const sheet = sheets[0]

  const students: ExcelCreateStudentsBatch[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheet])

  return students.map(item => ({
    cpf: formatCPF(String(item['CPF'])),
    username: item['NOME COMPLETO'],
    email: item['E-MAIL'],
    civilId: String(item['RG CIVIL']),
    birthday: item['DATA DE NASCIMENTO'],
    courseName: item['CURSO'],
    poleName: item['POLO']
  })) 
}

export function updateStudentsBatchExcelToJSON(fileUrl: string) {
  const workbook = xlsx.readFile(resolve(cwd(), fileUrl))

  const sheets = workbook.SheetNames
  const sheet = sheets[0]

  const students: ExcelUpdateStudentsBatch[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheet])

  return students.map(item => ({
    cpf: String(item['CPF']),
    username: item['NOME COMPLETO'],
    email: item['E-MAIL'],
    civilId: item['RG CIVIL'] ? String(item['RG CIVIL']) : undefined,
    birthday: item['DATA DE NASCIMENTO'],
    courseName: item['CURSO'],
    poleName: item['POLO']
  })) 
}

export function assessmentsBatchExcelToJSON(fileUrl: string) {
  const workbook = xlsx.readFile(resolve(cwd(), fileUrl))

  const sheets = workbook.SheetNames
  const sheet = sheets[0]

  const assessments: ExcelAssessmentsBatch[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheet])

  return assessments.map(item => ({
    cpf: String(item['CPF']),
    disciplineName: item['DISCIPLINA'],
    vf: item['VF'],
    avi: item['AVI'],
    avii: item['AVII'],
    vfe: item['VFE'],
  })) 
}

export function behaviorsBatchExcelToJSON(fileUrl: string) {
  const workbook = xlsx.readFile(resolve(cwd(), fileUrl))

  const sheets = workbook.SheetNames
  const sheet = sheets[0]

  const behaviors: ExcelBehaviorsBatch[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheet])

  return behaviors.map(item => ({
    cpf: String(item['CPF']),
    january: item['JANEIRO'],
    february: item['FEVEREIRO'],
    march: item['MARÇO'],
    april: item['ABRIL'],
    may: item['MAIO'],
    jun: item['JUNHO'],
    july: item['JULHO'],
    august: item['AGOSTO'],
    september: item['SETEMBRO'],
    october: item['OUTUBRO'],
    november: item['NOVEMBRO'],
    december: item['DEZEMBRO'],
  })) 
}
=======
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
    discipline: assessment['DISCIPLINA'],
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
  }))
}

>>>>>>> 475cc375b3f2ea5b2df4391ba52c8f454b9494a4
