import { CoursesPoleRepository } from "@/domain/boletim/app/repositories/courses-poles-repository.ts";
import { CoursePole } from "@/domain/boletim/enterprise/entities/course-pole.ts";

export class InMemoryCoursesPolesRepository implements CoursesPoleRepository {
  public items: CoursePole[] = []

  async findByCourseIdAndPoleId({ courseId, poleId }: { courseId: string; poleId: string; }): Promise<CoursePole | null> {
    const coursePole = this.items.find(item => item.courseId.toValue() === courseId && item.poleId.toValue() === poleId)
    return coursePole ?? null
  }

  async create(coursePole: CoursePole): Promise<void> {
    this.items.push(coursePole)
  }

  async createMany(coursesPoles: CoursePole[]): Promise<void> {
    coursesPoles.forEach(coursePole => {
      this.items.push(coursePole)
    })
  }
}