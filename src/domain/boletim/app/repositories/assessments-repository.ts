import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";

export interface StudentAssessmentsByCourse {
  studentId: string 
  courseId: string
}

export interface StudentAssessmentsByCourseAndDiscipline {
  courseId: string 
  disciplineId: string
}

export interface StudentAssessmentsByStudentAndDisciplineAndCourseId {
  studentId: string
  disciplineId: string 
  courseId: string
} 

export abstract class AssessmentsRepository {
  abstract findById({ id }: { id: string }): Promise<Assessment | null>
  abstract findByStudentIdAndCourseId({ studentId, courseId }: StudentAssessmentsByCourse): Promise<Assessment | null>
  abstract findByStudentAndDisciplineAndCourseId({
    courseId,
    disciplineId,
    studentId
  }: StudentAssessmentsByStudentAndDisciplineAndCourseId): Promise<Assessment | null>
  abstract findManyByStudentIdAndCourseId({ studentId, courseId }: StudentAssessmentsByCourse): Promise<Assessment[]>
  abstract findManyByDisciplineAndCourseId({ courseId, disciplineId }: StudentAssessmentsByCourseAndDiscipline): Promise<Assessment[]>
  abstract create(assessment: Assessment): Promise<void>
  abstract createMany(assessments: Assessment[]): Promise<void>
  abstract update(assessment: Assessment): Promise<void>
  abstract delete(assessment: Assessment): Promise<void>
}