import { ManagersRepository, SearchManagersManyDetails } from "@/domain/boletim/app/repositories/managers-repository.ts";
import { Manager } from "@/domain/boletim/enterprise/entities/manager.ts";
import { InMemoryManagersCoursesRepository } from "./in-memory-managers-courses-repository.ts";
import { InMemoryCoursesRepository } from "./in-memory-courses-repository.ts";
import { InMemoryManagersPolesRepository } from "./in-memory-managers-poles-repository.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { ManagerDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-details.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class InMemoryManagersRepository implements ManagersRepository {
  public items: Manager[] = []
  
  constructor (
    private managersCoursesRepository: InMemoryManagersCoursesRepository,
    private coursesRepository: InMemoryCoursesRepository,
    private managersPolesRepository: InMemoryManagersPolesRepository,
    private polesRepository: InMemoryPolesRepository
  ) {}


  async findById(id: string): Promise<Manager | null> {
    const manager = this.items.find(item => item.id.toValue() === id)
    return manager ?? null
  }

  async findDetailsById(id: string): Promise<ManagerDetails | null> {
    const manager = this.items.find(item => item.id.toValue() === id)
    if (!manager) return null

    const managersCourses = this.managersCoursesRepository.items.filter((item) => {
      return item.managerId.equals(manager.id)
    })

    const courses = managersCourses.map(managerCourse => {
      const course = this.coursesRepository.items.find(item => {
        return item.id.equals(managerCourse.courseId)
      })
      if (!course) throw new Error(`Course with ID ${managerCourse.courseId.toValue()} does not exist.`)

      return {
        managerCourseId: managerCourse.id,
        course
      }
    })

    const managersPoles = this.managersPolesRepository.items.filter((item, index) => {
      return item.managerId.equals(managersCourses[index].id)
    })

    const poles = managersPoles.map(managerPole => {
      const pole = this.polesRepository.items.find(item => {
        return item.id.equals(managerPole.poleId)
      })
      if (!pole) throw new Error(`Pole with ID ${managerPole.poleId.toValue()} does not exist.`)
    
      return {
        managerPoleId: managerPole.id,
        pole
      }
    })

    return ManagerDetails.create({
      managerId: manager.id,
      username: manager.username.value,
      civilId: manager.civilId ?? '',
      assignedAt: manager.createdAt,
      birthday: manager.birthday.value,
      cpf: manager.cpf.value,
      email: manager.email.value,
      courses,
      poles,
      role: 'manager'
    })
  }

  async findByCPF(cpf: string): Promise<Manager | null> {
    const manager = this.items.find(item => item.cpf.value === cpf)
    return manager ?? null
  }

  async findByEmail(email: string): Promise<Manager | null> {
    const manager = this.items.find(item => item.email.value === email)
    return manager ?? null
  }

  async searchManyDetails({ query, page }: SearchManagersManyDetails): Promise<ManagerDetails[]> {
    const PER_PAGE = 10

    const managers = this.items
      .filter(item => {
        return item.username.value.toLowerCase().includes(query.toLowerCase())
      })
      .slice((page - 1) * PER_PAGE, page * PER_PAGE)
      .sort((managerA, managerB) => {
        return managerA.username.value.localeCompare(managerB.username.value)
      })
      .map(manager => {
        const managerCourses = this.managersCoursesRepository.items.filter(item => {
          return item.managerId.equals(manager.id)
        })
        
        const courses = managerCourses.map(managerCourse => {
          const course = this.coursesRepository.items.find(item => {
            return item.id.equals(managerCourse.courseId)
          })
          if (!course) throw new Error(`Course with ID ${managerCourse.courseId.toValue()} does not exist.`)
    
          return {
            managerCourseId: managerCourse.id,
            course
          }
        })
    
        const managersPoles = this.managersPolesRepository.items.filter((item, index) => {
          return item.managerId.equals(managerCourses[index].id)
        })
    
        const poles = managersPoles.map(managerPole => {
          const pole = this.polesRepository.items.find(item => {
            return item.id.equals(managerPole.poleId)
          })
          if (!pole) throw new Error(`Pole with ID ${managerPole.poleId.toValue()} does not exist.`)
        
          return {
            managerPoleId: managerPole.id,
            pole
          }
        })

        return ManagerDetails.create({
          managerId: manager.id,
          username: manager.username.value,
          civilId: manager.civilId ?? '',
          cpf: manager.cpf.value,
          email: manager.email.value,
          birthday: manager.birthday.value,
          assignedAt: manager.createdAt,
          courses,
          poles,
          role: 'manager'
        })
      })

    return managers
  }

  async create(manager: Manager): Promise<void> {
    this.items.push(manager)

    DomainEvents.dispatchEventsForAggregate(manager.id)
  }

  async save(manager: Manager): Promise<void> {
    const managerIndex = this.items.findIndex(item => item.equals(manager))
    this.items[managerIndex] = manager

    DomainEvents.dispatchEventsForAggregate(manager.id)
  }

  async delete(manager: Manager): Promise<void> {
    const managerIndex = this.items.findIndex(item => item.equals(manager))
    const managersCourses = this.managersCoursesRepository.items.filter(item => item.managerId.equals(manager.id))

    for (const managerCourse of managersCourses) {
      const managerCourseIndex = this.managersCoursesRepository.items.findIndex(item => item.managerId.equals(managerCourse.managerId))
      const managerPoleIndex = this.managersPolesRepository.items.findIndex(item => item.managerId.equals(managerCourse.id))

      this.managersCoursesRepository.items.splice(managerCourseIndex, 1)
      this.managersPolesRepository.items.splice(managerPoleIndex, 1)
    }

    this.items.splice(managerIndex, 1)

    DomainEvents.dispatchEventsForAggregate(manager.id)
  }
}