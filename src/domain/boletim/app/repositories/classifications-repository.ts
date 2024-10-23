import type { Classification } from "../../enterprise/entities/classification.ts";

export interface FindByCourseAndStudentId {
  courseId: string
  studentId: string
}

export interface FindManyByCourseIdRequest {
  courseId: string
  page?: number
}

export interface FindManyByCourseAndPoleIdRequest {
  courseId: string
  poleId: string
  page?: number
}

export interface FindManyByCourseIdResponse {
  classifications: Classification[]
  pages?: number
  totalItems?: number
}

export abstract class ClassificationsRepository {
  abstract findByCourseAndStudentId({ courseId, studentId }: FindByCourseAndStudentId): Promise<Classification | null>
  abstract findManyByCourseId({ courseId, page }: FindManyByCourseIdRequest): Promise<FindManyByCourseIdResponse>
  abstract findManyByCourseAndPoleId({ courseId, page }: FindManyByCourseAndPoleIdRequest): Promise<FindManyByCourseIdResponse>
  abstract create(classification: Classification): Promise<void>
  abstract createMany(classifications: Classification[]): Promise<void>
  abstract save(classification: Classification): Promise<void>
  abstract saveMany(classifications: Classification[]): Promise<void>
}