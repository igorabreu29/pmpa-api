import { Course } from "@/domain/enterprise/entities/course.ts";

export abstract class CoursesRepository {
  abstract findManyByUserId(userId: string): Promise<Course[]>
  abstract findById(id: string): Promise<Course | null>
  abstract findByName(name: string): Promise<Course | null>
  abstract fetchCourses(): Promise<Course[]> 
  abstract create(course: Course): Promise<void> 
}