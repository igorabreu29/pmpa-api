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

  async findMany(page?: number): Promise<{ courses: Course[]; pages?: number; totalItems?: number; }> {
    if (page) {
      const allCourses = this.items.sort((courseA, courseB) => courseA.name.value.localeCompare(courseB.name.value))

      const courses = allCourses.slice((page - 1) * 10, page * 10)
      const pages = Math.ceil(allCourses.length / 10)
  
      return {
        courses,
        pages,
        totalItems: allCourses.length
      }
    }

    const courses = this.items.sort((courseA, courseB) => courseA.name.value.localeCompare(courseB.name.value))
    return {
      courses,
    }
  }

  async create(course: Course): Promise<void> {
    this.items.push(course)
  }

  async save(course: Course): Promise<void> {
    const courseIndex = this.items.findIndex(item => item.equals(course))
    this.items[courseIndex] = course
  }

  async delete(course: Course): Promise<void> {
    const courseIndex = this.items.findIndex(item => item.equals(course))
    this.items.splice(courseIndex, 1)
  }
}