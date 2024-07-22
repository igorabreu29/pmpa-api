import { StudentCourse } from "../../enterprise/entities/student-course.ts";
import { StudentCourseWithCourse } from "../../enterprise/entities/value-objects/student-course-with-course.ts";
import { StudentWithCourseAndPole } from "../../enterprise/entities/value-objects/student-with-course-and-pole.ts";

export abstract class StudentsCoursesRepository {
  abstract findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string, courseId: string }): Promise<StudentCourse | null>
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
    studentsCourse: StudentWithCourseAndPole[],
    pages: number
    totalItems: number
  }>
  abstract findManyByCourseIdAndPoleIdWithCourseAndPole({
    courseId,
    poleId,
    page,
    perPage
  }: {
    courseId: string
    poleId: string
    page: number
    perPage: number
  }): Promise<{
    studentsCourse: StudentWithCourseAndPole[],
    pages: number
    totalItems: number
  }>
  abstract create(studentCourse: StudentCourse): Promise<void>
  abstract createMany(studentsCourses: StudentCourse[]): Promise<void>
  abstract save(studentCourse: StudentCourse): Promise<void>
  abstract delete(studentCourse: StudentCourse): Promise<void>
}