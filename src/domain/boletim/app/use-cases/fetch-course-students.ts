import { Either, right } from "@/core/either.ts"
import { Role, User } from "@/domain/boletim/enterprise/entities/user.ts"
import { UsersRepository } from "../repositories/users-repository.ts"

interface FetchCourseStudentsUseCaseRequest {
  courseId: string
  poleId?: string
  page: number
  perPage: number
  role?: Role
}

type FetchCourseStudentsUseCaseResponse = Either<null, {
  users: User[]
  pages: number
  totalItems: number
}>

export class FetchCourseStudentsUseCase {
  constructor (
    private usersRepository: UsersRepository
  ) {}

  async execute({ courseId, poleId, page, perPage, role }: FetchCourseStudentsUseCaseRequest): Promise<FetchCourseStudentsUseCaseResponse> {
    if (role === 'manager') {
      const { users, pages, totalItems } = await this.usersRepository.findManyByCourseIdAndPoleId({
        courseId,
        page,
        perPage,
        poleId: String(poleId),
        role: 'student',
      })

      return right({
        users,
        pages, 
        totalItems
      })
    }

    const { users, pages, totalItems} = await this.usersRepository.findManyByCourseId({
      courseId,
      page,
      perPage,
      role: 'student',
    })

    return right({ users, pages, totalItems })
  }
}