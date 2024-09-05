import { StudentCourse } from "../../enterprise/entities/student-course.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import { StudentCourseWithCourse } from "../../enterprise/entities/value-objects/student-course-with-course.ts";
import { StudentWithCourse } from "../../enterprise/entities/value-objects/student-with-course.ts";
import type { StudentWithPole } from "../../enterprise/entities/value-objects/student-with-pole.ts";

export interface SearchManyDetails {
  courseId: string
  query: string
  page: number
}

export abstract class StudentsCoursesRepository {
  abstract findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string, courseId: string }): Promise<StudentCourse | null>
  abstract findDetailsByCourseAndStudentId({
    courseId,
    studentId
  }: {
    courseId: string
    studentId: string
  }): Promise<StudentCourseDetails | null>

  abstract findManyByCourseIdWithPole({ courseId }: { courseId: string }): Promise<StudentWithPole[]>
  abstract findManyByStudentIdWithCourse({
    studentId,
    page,
    perPage
  }: {
    studentId: string
    page: number
    perPage: number
  }): Promise<{
    studentCourses: StudentWithCourse[],
    pages: number
    totalItems: number
  }>

  abstract findManyDetailsByCourseId({
    courseId,
    page,
    cpf,
    isEnabled,
    username,
    perPage
  }: {
    courseId: string
    page?: number
    cpf?: string
    username?: string
    isEnabled?: boolean
    perPage: number
  }): Promise<{
    studentsCourse: StudentCourseDetails[],
    pages?: number
    totalItems?: number
  }>

  abstract searchManyDetailsByCourseId({
    courseId,
    query,
    page
  }: SearchManyDetails): Promise<{
    studentCoursesDetails: StudentCourseDetails[]
    pages: number
    totalItems: number
  }>

  abstract create(studentCourse: StudentCourse): Promise<void>
  abstract createMany(studentsCourses: StudentCourse[]): Promise<void>

  abstract save(studentCourse: StudentCourse): Promise<void>
  abstract updateStatus(studentCourse: StudentCourse): Promise<void>

  abstract delete(studentCourse: StudentCourse): Promise<void>
}