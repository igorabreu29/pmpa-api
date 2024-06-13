import { CoursesRepository } from "@/domain/app/repositories/courses-repository.ts";
import { Course } from "@/domain/enterprise/entities/course.ts";
import { Role } from "@/domain/enterprise/entities/user.ts";

export class InMemoryCoursesRepository implements CoursesRepository {
  public items: Course[] = []

  async findById(id: string): Promise<Course | null> {
    const course = this.items.find(item => item.id.toValue() === id)
    return course ?? null
  }

  async findManyByUserId(userId: string): Promise<Course[]> {
    const course = this.items.filter(item => item.users?.find(user => user.id.toValue() === userId))
    return course
  }

  async findByName(name: string): Promise<Course | null> {
    const course = this.items.find(item => item.name === name)
    return course ?? null
  }

  async fetchCourses(): Promise<Course[]> {
    return this.items
  }

  async create(course: Course): Promise<void> {
    this.items.push(course)
  }
}