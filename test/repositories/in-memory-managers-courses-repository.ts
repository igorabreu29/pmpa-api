import { ManagersCoursesRepository } from "@/domain/boletim/app/repositories/managers-courses-repository.ts";
import { ManagerCourse } from "@/domain/boletim/enterprise/entities/manager-course.ts";
import { InMemoryManagersPolesRepository } from "./in-memory-managers-poles-repository.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { ManagerWithCourseAndPole } from "@/domain/boletim/enterprise/entities/value-objects/manager-with-course-and-pole.ts";
import { InMemoryManagersRepository } from "./in-memory-managers-repository.ts";
import { InMemoryCoursesRepository } from "./in-memory-courses-repository.ts";
import { ManagerWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/manager-with-course.ts";

export class InMemoryManagersCoursesRepository implements ManagersCoursesRepository {
  public items: ManagerCourse[] = []

  constructor (
    private managersRepository: InMemoryManagersRepository,
    private coursesRepository: InMemoryCoursesRepository,
    private managersPolesRepository: InMemoryManagersPolesRepository,
    private polesRepository: InMemoryPolesRepository
  ) {}

  async findByManagerIdAndCourseId({ managerId, courseId }: { managerId: string; courseId: string; }): Promise<ManagerCourse | null> {
    const studentCourse = this.items.find(item => item.managerId.toValue() === managerId && item.courseId.toValue() === courseId)
    return studentCourse ?? null
  }

  async findManyByCourseIdWithCourseAndPole({ 
    courseId, 
    page, 
    perPage 
  }: { 
    courseId: string; 
    page: number; 
    perPage: number; 
  }): Promise<{ 
    managersCourse: ManagerWithCourseAndPole[]; 
    pages: number; 
    totalItems: number; 
  }> {
    const allManagersCourses = this.items
      .filter(item => item.courseId.toValue() === courseId)
      .map(managerCourse => {
        const manager = this.managersRepository.items.find(item => {
          return item.id.equals(managerCourse.managerId)
        })
        if (!manager) throw new Error(`Manager with ID ${managerCourse.managerId.toValue()} does not exist.`)

        const course = this.coursesRepository.items.find(item => {
          return item.id.equals(managerCourse.courseId)
        })
        if (!course) throw new Error(`Course with ID ${managerCourse.courseId.toValue()} does not exist.`)

        const managerPole = this.managersPolesRepository.items.find(item => { 
          return item.managerId.equals(managerCourse.id)
        })
        if (!managerPole) throw new Error(`Manager with ID ${managerCourse.managerId.toValue()} does not exist.`)

        const pole = this.polesRepository.items.find(item => {
          return item.id.equals(managerPole.poleId)
        })
        if (!pole) throw new Error(`Pole with ID ${managerPole.poleId.toValue()} does not exist.`)
        
        return ManagerWithCourseAndPole.create({
          managerId: manager.id,
          username: manager.username,
          email: manager.email,
          cpf: manager.cpf,
          assignedAt: manager.createdAt,
          courseId: course.id,
          course: course.name,
          poleId: pole.id,
          pole: pole.name
        })
      })

      const managersCourse = allManagersCourses.slice((page - 1) * perPage, page * perPage)
      const pages = Math.ceil(allManagersCourses.length / perPage)
      
      return {
        managersCourse,
        pages,
        totalItems: allManagersCourses.length
      }
  }

  async findManyByManagerIdWithCourse({ 
    managerId, 
    page, 
    perPage 
  }: { 
    managerId: string; 
    page: number; 
    perPage: number; 
  }): Promise<{ 
    managerCourses: ManagerWithCourse[]; 
    pages: number; 
    totalItems: number; 
  }> {
    const allManagerCourses = this.items
      .filter(item => item.managerId.toValue() === managerId)
      .map(managerCourse => {
        const manager = this.managersRepository.items.find(item => {
          return item.id.equals(managerCourse.managerId)
        })
        if (!manager) throw new Error(`Manager with ID ${managerCourse.managerId.toValue()} does not exist.`)

        const course = this.coursesRepository.items.find(item => {
          return item.id.equals(managerCourse.courseId)
        })
        if (!course) throw new Error(`Course with ID ${managerCourse.courseId.toValue()} does not exist.`)

        return ManagerWithCourse.create({
          managerId: manager.id,
          username: manager.username,
          cpf: manager.cpf,
          email: manager.email,
          assignedAt: manager.createdAt,
          courseId: course.id,
          course: course.name,
          imageUrl: course.imageUrl
        })
      })

      const managerCourses = allManagerCourses.slice((page - 1) * perPage, page * perPage)
      const pages = Math.ceil(allManagerCourses.length / perPage)

      return {
        managerCourses,
        pages,
        totalItems: allManagerCourses.length
      }
  }

  async create(managerCourse: ManagerCourse): Promise<void> {
    this.items.push(managerCourse)
  }
}