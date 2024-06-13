import { Either, right } from "@/core/either.ts"
import { User } from "@/domain/enterprise/entities/user.ts"
import { UsersRepository } from "../repositories/users-repository.ts"

interface FetchCourseUsersUseCaseRequest {
  courseId: string
  page: number
}

type FetchCourseUsersUseCaseResponse = Either<null, {
  users: User[]
  pages: number
  totalUsers: number
}>

export class FetchCourseUsersUseCase {
  constructor(
    private usersRepository: UsersRepository
  ) {}

  async execute({ courseId, page }: FetchCourseUsersUseCaseRequest): Promise<FetchCourseUsersUseCaseResponse> {
    const allUsers = await this.usersRepository.findManyByCourseId({ courseId })

    const users = allUsers.slice((page - 1) * 10, page * 10)
    const pages = Math.ceil(allUsers.length / 10)
    const totalUsers = allUsers.length

    return right({ users, pages, totalUsers })
  }
}