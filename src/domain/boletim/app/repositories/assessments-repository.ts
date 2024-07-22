import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";

export interface StudentAssessmentsByCourse {
  studentId: string 
  courseId: string
}

export interface StudentAssessmentsByCourseAndPole {
  studentId: string 
  courseId: string
  poleId: string
}

export abstract class AssessmentsRepository {
  abstract findById({ id }: { id: string }): Promise<Assessment | null>
  abstract findByStudentIdAndCourseId({ studentId, courseId }: StudentAssessmentsByCourse): Promise<Assessment | null>
  abstract findManyByStudentIdAndCourseId({ studentId, courseId }: StudentAssessmentsByCourse): Promise<Assessment[]>
  abstract create(assesment: Assessment): Promise<void>
  abstract createMany(assesments: Assessment[]): Promise<void>
  abstract update(assesment: Assessment): Promise<void>
  abstract delete(assesment: Assessment): Promise<void>
}