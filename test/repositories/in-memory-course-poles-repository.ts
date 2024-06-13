import { CoursePolesRepository } from "@/domain/app/repositories/pole-course-repository.ts"
import { CoursePole } from "@/domain/enterprise/entities/course-pole.ts"

export class InMemoryCoursePolesRepository implements CoursePolesRepository {
  public items: CoursePole[] = []

  async findByPoleId(poleId: string): Promise<CoursePole | null> {
    const poleCourse = this.items.find(item => item.poleId.toValue() === poleId)
    return poleCourse ?? null
  }

  async findByCourseIdAndPoleId(courseId: string, poleId: string): Promise<CoursePole | null> {
    const courseDiscipline = this.items.find(item => item.courseId.toValue() === courseId && item.poleId.toValue() === poleId)
    return courseDiscipline ?? null
  }

  async create(CoursePole: CoursePole): Promise<void> {
    this.items.push(CoursePole)
  }

  async createMany(coursePoles: CoursePole[]): Promise<void> {
    coursePoles.forEach(coursePole => {
      this.items.push(coursePole)
    })
  }
}