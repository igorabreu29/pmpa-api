import { ManagersCoursesRepository } from "@/domain/boletim/app/repositories/managers-courses-repository.ts";
import { ManagerCourse } from "@/domain/boletim/enterprise/entities/manager-course.ts";

export class InMemoryManagersCoursesRepository implements ManagersCoursesRepository {
  public items: ManagerCourse[] = []

  async findByManagerIdAndCourseId({ managerId, courseId }: { managerId: string; courseId: string; }): Promise<ManagerCourse | null> {
    const studentCourse = this.items.find(item => item.managerId.toValue() === managerId && item.courseId.toValue() === courseId)
    return studentCourse ?? null
  }

  async create(managerCourse: ManagerCourse): Promise<void> {
    this.items.push(managerCourse)
  }
}