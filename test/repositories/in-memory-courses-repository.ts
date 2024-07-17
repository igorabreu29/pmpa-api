import { CoursesRepository, SearchAllCoursesByUserId } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";

export class InMemoryCoursesRepository implements CoursesRepository {
  public items: Course[] = []

  async findById(id: string): Promise<Course | null> {
    const course = this.items.find(item => item.id.toValue() === id)
    return course ?? null
  }

  async findByName(name: string): Promise<Course | null> {
    const course = this.items.find(item => item.name.value === name)
    return course ?? null
  }

  async fetchCourses(): Promise<Course[]> {
    return this.items
  }

  async create(course: Course): Promise<void> {
    this.items.push(course)
  }
}