import { StudentCourse } from "../../enterprise/entities/student-course.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import { StudentCourseWithCourse } from "../../enterprise/entities/value-objects/student-course-with-course.ts";
import type { StudentWithPole } from "../../enterprise/entities/value-objects/student-with-pole.ts";

export interface SearchManyDetails {
  courseId: string
  query: string
  page: number
}

export abstract class StudentsCoursesRepository {
  abstract findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string, courseId: string }): Promise<StudentCourse | null>

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
    studentCourses: StudentCourseWithCourse[],
    pages: number
    totalItems: number
  }>

  abstract findManyByCourseIdWithCourse({
    courseId,
    page,
    perPage
  }: {
    courseId: string
    page: number
    perPage: number
  }): Promise<{
    studentsCourse: StudentCourseWithCourse[],
    pages: number
    totalItems: number
  }>

  abstract findManyByCourseIdWithCourseAndPole({
    courseId,
    page,
    perPage
  }: {
    courseId: string
    page: number
    perPage: number
  }): Promise<{
    studentsCourse: StudentCourseDetails[],
    pages: number
    totalItems: number
  }>

  abstract searchManyDetailsByCourseId({
    courseId,
    query,
    page
  }: SearchManyDetails): Promise<StudentCourseDetails[]>

  abstract create(studentCourse: StudentCourse): Promise<void>
  abstract createMany(studentsCourses: StudentCourse[]): Promise<void>

  abstract save(studentCourse: StudentCourse): Promise<void>
  abstract delete(studentCourse: StudentCourse): Promise<void>
}