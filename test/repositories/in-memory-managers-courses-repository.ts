import { ManagersCoursesRepository } from "@/domain/boletim/app/repositories/managers-courses-repository.ts";
import { ManagerCourse } from "@/domain/boletim/enterprise/entities/manager-course.ts";
import { InMemoryManagersPolesRepository } from "./in-memory-managers-poles-repository.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { InMemoryManagersRepository } from "./in-memory-managers-repository.ts";
import { InMemoryCoursesRepository } from "./in-memory-courses-repository.ts";
import { ManagerWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/manager-with-course.ts";
import { ManagerCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-course-details.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class InMemoryManagersCoursesRepository implements ManagersCoursesRepository {
  public items: ManagerCourse[] = []

  constructor (
    private managersRepository: InMemoryManagersRepository,
    private coursesRepository: InMemoryCoursesRepository,
    private managersPolesRepository: InMemoryManagersPolesRepository,
    private polesRepository: InMemoryPolesRepository
  ) {}

  async findByCourseId({ courseId }: { courseId: string; }): Promise<ManagerCourse | null> {
    const managerCourse = this.items.find(item => item.courseId.toValue() === courseId)
    return managerCourse ?? null
  }

  async findByManagerIdAndCourseId({ managerId, courseId }: { managerId: string; courseId: string; }): Promise<ManagerCourse | null> {
    const managerCourse = this.items.find(item => item.managerId.toValue() === managerId && item.courseId.toValue() === courseId)
    return managerCourse ?? null
  }

  async findDetailsByManagerAndCourseId({ 
    managerId, 
    courseId 
  }: { 
    managerId: string; 
    courseId: string; 
  }): Promise<ManagerCourseDetails | null> {
      const managerCourse = this.items.find(item => {
        return item.managerId.toValue() === managerId && item.courseId.toValue() === courseId
      })
      if (!managerCourse) return null

      const manager = this.managersRepository.items.find(item => {
        return item.id.equals(managerCourse.managerId)
      })
      if (!manager) throw new Error(`Manager with ID ${managerCourse.managerId.toValue()} does not exist`)

      const course = this.coursesRepository.items.find(item => {
        return item.id.equals(managerCourse.courseId)
      })
      if (!course) throw new Error(`Course with ID ${managerCourse.courseId.toValue()} does not exist`)
      
      const managerPole = this.managersPolesRepository.items.find(item => {
        return item.managerId.equals(managerCourse.id)
      })
      if (!managerPole) throw new Error(`Manager with ID ${managerCourse.managerId.toValue()} does not exist`)

      const pole = this.polesRepository.items.find(item => {
        return item.id.equals(managerPole.poleId)
      })
      if (!pole) throw new Error(`Pole with ID ${managerPole.poleId.toValue()} does not exist`)

      return ManagerCourseDetails.create({
        managerId: managerCourse.managerId,
        cpf: manager.cpf.value,
        email: manager.email.value,
        username: manager.username.value,
        assignedAt: manager.createdAt,
        courseId: managerCourse.courseId,
        course: course.name.value,
        poleId: pole.id,
        pole: pole.name.value
      })
  }

  async findManyDetailsByCourseId({ 
    courseId, 
    page, 
    cpf,
    isEnabled = true,
    username,
    perPage 
  }: { 
    courseId: string; 
    page: number; 
    cpf?: string
    username?: string
    isEnabled?: boolean
    perPage: number; 
  }): Promise<{ 
    managersCourse: ManagerCourseDetails[]; 
    pages: number; 
    totalItems: number; 
  }> {
    const allManagersCourses = this.items
      .filter(item => item.courseId.toValue() === courseId && isEnabled ? item.isActive : !item.isActive)
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
        
        return ManagerCourseDetails.create({
          managerId: manager.id,
          username: manager.username.value,
          email: manager.email.value,
          cpf: manager.cpf.value,
          assignedAt: manager.createdAt,
          courseId: course.id,
          course: course.name.value,
          poleId: pole.id,
          pole: pole.name.value
        })
      }).filter(item => {
        return item.username.toLowerCase().includes(username ? username.toLowerCase() : '') && 
          item.cpf.toLowerCase().includes(cpf || '')
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
          username: manager.username.value,
          cpf: manager.cpf.value,
          email: manager.email.value,
          assignedAt: manager.createdAt,
          courseId: course.id,
          course: course.name.value,
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

  async updateStatus(managerCourse: ManagerCourse): Promise<void> {
    const managerCourseIndex = this.items.findIndex(item => item.id.equals(managerCourse.id))
    this.items[managerCourseIndex] = managerCourse

    DomainEvents.dispatchEventsForAggregate(managerCourse.id)
  }

  async delete(managerCourse: ManagerCourse): Promise<void> {
    const managerPoleIndex = this.managersPolesRepository.items.findIndex(item => item.managerId.equals(managerCourse.id))
    this.managersPolesRepository.items.splice(managerPoleIndex, 1)

    const managerCourseIndex = this.items.findIndex(item => item.equals(managerCourse))
    this.items.splice(managerCourseIndex, 1)

    DomainEvents.dispatchEventsForAggregate(managerCourse.id)
  }
}