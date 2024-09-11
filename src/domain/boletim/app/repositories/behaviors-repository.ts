import { Behavior } from "@/domain/boletim/enterprise/entities/behavior.ts";

export interface FindByStudentAndCourseAndYear {
  studentId: string
  courseId: string
  year: number
}

export abstract class BehaviorsRepository {
  abstract findById({ id }: { id: string }): Promise<Behavior | null> 
  abstract findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string, courseId: string }): Promise<Behavior | null>
  abstract findByStudentAndCourseIdAndYear({ studentId, courseId, year }: FindByStudentAndCourseAndYear): Promise<Behavior | null>
  abstract findManyByCourseId({ courseId }: { courseId: string }): Promise<Behavior[]>
  abstract findManyByStudentIdAndCourseId({ studentId, courseId }: { studentId: string, courseId: string }): Promise<Behavior[]>
  abstract create(behavior: Behavior): Promise<void>
  abstract update(behavior: Behavior): Promise<void>
  abstract delete(behavior: Behavior): Promise<void>
}