import { User } from "@/domain/enterprise/entities/user.ts";

export abstract class UsersRepository {
  abstract findByCPFAndCourseId({ cpf, courseId }: { cpf: string, courseId: string }): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract findByCPF(CPF: string): Promise<User | null>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findManyByCourseId({ courseId }: { courseId: string }): Promise<User[]>
  abstract findManyByCourseIdAndWhoHaveConfirmedLogin({ courseId }: { courseId: string }): Promise<User[]>
  abstract create(user: User): Promise<void>
  abstract createMany(users: User[]): Promise<void>
  abstract update(user: User): Promise<void>
}