import { Course } from "@/domain/boletim/enterprise/entities/course.ts";

export interface SearchAllCoursesByUserId {
  userId: string
  page: number
  perPage: number
}

export abstract class CoursesRepository {
  abstract findManyByUserId({ userId, page, perPage }: SearchAllCoursesByUserId): Promise<{ courses: Course[], pages: number, totalItems: number }>
  abstract findById(id: string): Promise<Course | null>
  abstract findByName(name: string): Promise<Course | null>
  abstract fetchCourses(): Promise<Course[]> 
  abstract create(course: Course): Promise<void> 
}