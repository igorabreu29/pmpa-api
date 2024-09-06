import { formatCPF } from '@/core/utils/formatCPF.ts';
import xlsx from 'xlsx';
import { resolve } from 'node:path';
import { cwd } from 'node:process'
import fileSystem from 'node:fs'

export interface ExcelCreateStudentsBatch {
  CPF: number
  'NOME COMPLETO': string
  'E-MAIL': string
  'RG CIVIL': number
  'DATA DE NASCIMENTO': Date
  'CURSO': string
  'POLO': string
}

export interface ExcelUpdateStudentsBatch {
  CPF: number
  'NOME COMPLETO'?: string
  'E-MAIL'?: string
  'RG CIVIL'?: number
  'DATA DE NASCIMENTO'?: Date
  'CURSO'?: string
  'POLO'?: string
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