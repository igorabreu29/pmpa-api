import { UsersRepository } from "@/domain/boletim/app/repositories/users-repository.ts";
import { Role, User } from "@/domain/boletim/enterprise/entities/user.ts";
import { InMemoryUsersCourseRepository } from "./in-memory-users-course-repository.ts";
import { UserWithPole } from "@/domain/boletim/enterprise/entities/value-objects/user-with-pole.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { InMemoryUserPolesRepository } from "./in-memory-user-poles-repository.ts";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] =  []

  constructor (
    private usersCoursesRepository: InMemoryUsersCourseRepository,
    private usersPolesRepository: InMemoryUserPolesRepository,
    private polesRepository: InMemoryPolesRepository
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = this.items.find(item => item.id.toValue() === id)
    return user ?? null
  }

  async findByCPF(CPF: string): Promise<User | null> {
    const user = this.items.find(item => item.cpf === CPF)
    return user ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find(item => item.email === email)
    return user ?? null
  }

  async findByCPFAndCourseId({ cpf, courseId }: { cpf: string, courseId: string }): Promise<User | null> {
    const user = this.items.find((item) => {
      return item.cpf === cpf && 
      this.usersCoursesRepository.items.find(userCourse => {
        return userCourse.userId === item.id && userCourse.courseId.toValue() === courseId
      })
    })

    return user ?? null
  }

  async findManyByCourseId(
    { 
      courseId, 
      role, 
      page, 
      perPage 
    }: { 
      courseId: string, 
      role: Role, 
      page: number, 
      perPage: number 
    }
  ): Promise<{
    users: User[]
    pages: number
    totalItems: number
  }> {
    const allUsers = this.items
      .filter(item => item.role === role && item.active === true)
      .map(user => {
        const userCourse = this.usersCoursesRepository.items.find(userCourse => {
          return userCourse.userId === user.id && userCourse.courseId.toValue() === courseId
        })

        if (!userCourse) {
          throw new Error(`User with ID "${user.id.toValue()} does not exist."`)
        }

        return User.create({
          username: user.username,
          active: user.active,
          cpf: user.cpf,
          email: user.email,
          password: user.password,
          role: user.role,
          birthday: user.birthday
        }, user.id)
    })

    const users = allUsers.slice((page - 1) * perPage, page * perPage)
    const pages = Math.ceil(allUsers.length / perPage)
       
    return {
      users,
      pages,
      totalItems: allUsers.length
    }
  }

  async findManyByCourseIdWithPole({
    courseId, 
    role, 
    page, 
    perPage 
  }: { 
    courseId: string; 
    role: Role; 
    page: number; 
    perPage: number; 
  }): Promise<{ 
    users: UserWithPole[]; 
    pages: number; 
    totalItems: number; 
  }> {
    const allUsers = this.items
      .filter(item => item.role === role && item.active === true)
      .map(user => {
        const userCourse = this.usersCoursesRepository.items.find(userCourse => {
          return userCourse.userId === user.id && userCourse.courseId.toValue() === courseId
        })
        if (!userCourse) throw new Error(`User with ID "${user.id.toValue()} does not exist."`)

        const userPole = this.usersPolesRepository.items.find(userPole => {
          return userPole.userId === user.id
        })
        if (!userPole) throw new Error(`User with ID "${user.id.toValue()} does not exist."`)
        
        const pole = this.polesRepository.items.find(pole => {
          return pole.courseId === userCourse.courseId && pole.id === userPole.poleId
        })
        if (!pole) throw new Error(`Pole with ID "${userPole.poleId.toValue()} does not exist."`)

        return UserWithPole.create({
          username: user.username,
          active: user.active,
          cpf: user.cpf,
          email: user.email,
          role: user.role,
          civilID: user.documents?.civilID,
          birthday: user.birthday,
          pole: pole.name,
          poleId: pole.id,
          userId: user.id
        })
    })

    const users = allUsers.slice((page - 1) * perPage, page * perPage)
    const pages = Math.ceil(allUsers.length / perPage)
      
    return {
      users,
      pages,
      totalItems: allUsers.length
    }
  }

  async findManyByCourseIdAndPoleId(
    { 
      courseId, 
      poleId,
      role, 
      page, 
      perPage 
    }: { 
      courseId: string, 
      poleId: string
      role: Role, 
      page: number, 
      perPage: number 
    }
  ): Promise<{
    users: User[]
    pages: number
    totalItems: number
  }> {
    const allUsers = this.items
      .filter(item => item.role === role && item.active === true)
      .map(item => {
        const userCourse = this.usersCoursesRepository.items.find(userCourse => {
          return userCourse.userId === item.id && userCourse.courseId.toValue() === courseId
        })

        if (!userCourse) {
          throw new Error(`User with ID "${item.id.toValue()} does not exist."`)
        }
     
        const userPole = this.usersPolesRepository.items.find(userPole => {
          return userCourse.userId === item.id && userPole.poleId.toValue() === poleId
        })
        if (!userPole) {
          throw new Error(`User with ID "${item.id.toValue()} does not exist."`)
        }

        return item
    })
    
    const users = allUsers.slice((page - 1) * perPage, page * perPage)
    const pages = Math.ceil(allUsers.length / perPage)
       
    return {
      users,
      pages,
      totalItems: allUsers.length
    }
  }
  
  async findManyByCourseIdAndPoleIdWithPole(
    { 
      courseId, 
      poleId,
      role, 
      page, 
      perPage 
    }: { 
      courseId: string, 
      poleId: string,
      role: Role, 
      page: number, 
      perPage: number 
    }
  ): Promise<{
    users: UserWithPole[]
    pages: number
    totalItems: number
  }> {
    const allUsers = this.items
      .filter(item => item.role === role && item.active === true)
      .map(user => {
        const userCourse = this.usersCoursesRepository.items.find(userCourse => {
          return userCourse.userId === user.id && userCourse.courseId.toValue() === courseId
        })
        if (!userCourse) {
          throw new Error(`User with ID "${user.id.toValue()} does not exist."`)
        }

        const userPole = this.usersPolesRepository.items.find(userPole => {
          return userPole.userId === user.id && userPole.poleId.toValue() === poleId
        })
        if (!userPole) {
          throw new Error(`User with ID "${user.id.toValue()} does not exist."`)
        }

        const pole = this.polesRepository.items.find(pole => {
          return pole.id === userPole.poleId && pole.courseId === userCourse.courseId
        })
        if (!pole) {
          throw new Error(`User with ID "${userPole.poleId.toValue()} does not exist."`)
        }

        return UserWithPole.create({
          userId: user.id,
          username: user.username,
          active: user.active,
          cpf: user.cpf,
          email: user.email,
          role: user.role,
          poleId: pole.id,
          pole: pole.name,
          civilID: user.documents?.civilID
        })
    })

    const users = allUsers.slice((page - 1) * perPage, page * perPage)
    const pages = Math.ceil(allUsers.length / perPage)
       
    return {
      users,
      pages,
      totalItems: allUsers.length
    }
  }

  async findManyByCourseIdAndWhoHaveConfirmedLogin({ courseId }: { courseId: string; }): Promise<User[]> {
    const users = this.items
      .filter(item => item.loginConfirmation && item.active === true)
      .map(user => {
        const userCourse = this.usersCoursesRepository.items.find(userCourse => {
          return userCourse.userId === user.id && userCourse.courseId.toValue() === courseId
        })

        if (!userCourse) {
          throw new Error(`User with ID "${user.id.toValue()} does not exist."`)
        }
        
        return user
      })

    return users
  }

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async createMany(users: User[]): Promise<void> {
    users.map(user => {
      this.items.push(user)
    })
  }

  async update(user: User): Promise<void> {
    const userIndex = this.items.findIndex(item => item.id === user.id)
    this.items[userIndex] = user
  }
}