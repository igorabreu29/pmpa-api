import { Role, User } from "@/domain/boletim/enterprise/entities/user.ts";
import { UserWithPole } from "@/domain/boletim/enterprise/entities/value-objects/user-with-pole.ts";

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>
  abstract findByCPF(CPF: string): Promise<User | null>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findByCPFAndCourseId({ cpf, courseId }: { cpf: string, courseId: string }): Promise<User | null>
  
  abstract findManyByCourseId (
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
  }> 

  abstract findManyByCourseIdWithPole (
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
    users: UserWithPole[]
    pages: number
    totalItems: number
  }>

  abstract findManyByCourseIdAndPoleId (
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
  }>

  abstract findManyByCourseIdAndPoleIdWithPole (
    { 
      courseId, 
      poleId,
      role, 
      page, 
      perPage,
    }: { 
      courseId: string, 
      poleId: string,
      role: Role, 
      page: number, 
      perPage: number,
    }
  ): Promise<{
    users: UserWithPole[]
    pages: number
    totalItems: number
  }>

  abstract findManyByCourseIdAndWhoHaveConfirmedLogin({ courseId }: { courseId: string }): Promise<User[]>
  abstract create(user: User): Promise<void>
  abstract createMany(users: User[]): Promise<void>
  abstract update(user: User): Promise<void>
}