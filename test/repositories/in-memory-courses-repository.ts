import { CoursesRepository, SearchAllCoursesByUserId } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { UsersCourseRepository } from "@/domain/boletim/app/repositories/users-course-repository.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";

export class InMemoryCoursesRepository implements CoursesRepository {
  public items: Course[] = []

  async findById(id: string): Promise<Course | null> {
    const course = this.items.find(item => item.id.toValue() === id)
    return course ?? null
  }

  async findManyByUserId({ userId, page, perPage }: SearchAllCoursesByUserId): Promise<{ courses: Course[], pages: number, totalItems: number }> {
    const allCourses = this.items
      .map(item => {
        const user = this.usersCoursesRepository.findByCourseIdAndUserId({ courseId: item.id.toValue(), userId })
        if (!user) {
          throw new Error(`Course with ID "${item.id.toValue()} does not exist."`)
        }

        return Course.create({
          name: item.name,
          active: item.active,
          formule: item.formule,
          imageUrl: item.imageUrl,
          modules: item.modules,
          periods: item.periods,
        })
      }) 

    const courses = allCourses.slice((page - 1) * perPage, page * perPage)
    const pages = Math.ceil(allCourses.length / perPage)

    return {
      courses,
      pages,
      totalItems: allCourses.length
    }
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