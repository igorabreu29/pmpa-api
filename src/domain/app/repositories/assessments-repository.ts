import { Assessment } from "@/domain/enterprise/entities/assessment.ts";
import { Role } from "@/domain/enterprise/entities/user.ts";

export interface StudentAssessmentsByCourse {
  courseId?: string
  userRole?: Role
  studentId: string 
  studentCourseId: string
}

export abstract class AssessmentsRepository {
  abstract findByStudentIdAndCourseId({ courseId, studentId, studentCourseId, userRole }: StudentAssessmentsByCourse): Promise<Assessment | null>
  abstract findById({ id }: { id: string }): Promise<Assessment | null>
  abstract findManyByStudentIdAndCourseId({ studentId, courseId, studentCourseId, userRole }: StudentAssessmentsByCourse): Promise<Assessment[]>
  abstract create(assesment: Assessment): Promise<void>
  abstract createMany(assesments: Assessment[]): Promise<void>
  abstract update(assesment: Assessment): Promise<void>
  abstract delete(assesment: Assessment): Promise<void>
}