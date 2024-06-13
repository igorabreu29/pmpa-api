import { UsersRepository } from "@/domain/app/repositories/users-repository.ts";
import { Role, User } from "@/domain/enterprise/entities/user.ts";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] =  []

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
      return item.cpf === cpf && item.courses.find(course => course.id.toValue() === courseId) && item.role === 'student'
    })

    return user ?? null
  }

  async findManyByCourseId({ courseId }: { courseId: string, page: number }): Promise<User[]> {
    const users = this.items.filter(item => item.courses.find(course => course.id.toValue() === courseId) && item.role === 'student')   
    return users
  }

  async findManyByCourseIdAndWhoHaveConfirmedLogin({ courseId }: { courseId: string; }): Promise<User[]> {
    const users = this.items.filter(item => item.courses.find(course => course.id.toValue() === courseId) && item.loginConfirmation === true)   
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