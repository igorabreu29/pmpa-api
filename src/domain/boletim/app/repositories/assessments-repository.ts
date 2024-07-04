import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";
import { Role } from "@/domain/boletim/enterprise/entities/user.ts";

export interface StudentAssessmentsByCourse {
  studentId: string 
  studentCourseId: string
}

export interface StudentAssessmentsByCourseAndPole {
  studentId: string 
  courseId: string
  poleId: string
}

export abstract class AssessmentsRepository {
  abstract findById({ id }: { id: string }): Promise<Assessment | null>
  abstract findByStudentIdAndCourseId({ studentId, studentCourseId }: StudentAssessmentsByCourse): Promise<Assessment | null>
  abstract findManyByStudentIdAndCourseId({ studentId, studentCourseId }: StudentAssessmentsByCourse): Promise<Assessment[]>
  abstract findManyByStudentIdAndCourseIdAndPoleId({ studentId, courseId, poleId }: StudentAssessmentsByCourseAndPole): Promise<Assessment[]>
  abstract create(assesment: Assessment): Promise<void>
  abstract createMany(assesments: Assessment[]): Promise<void>
  abstract update(assesment: Assessment): Promise<void>
  abstract delete(assesment: Assessment): Promise<void>
}