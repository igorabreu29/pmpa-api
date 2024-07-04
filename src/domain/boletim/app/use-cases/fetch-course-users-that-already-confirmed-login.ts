import { Either, right } from "@/core/either.ts";
import { User } from "@/domain/boletim/enterprise/entities/user.ts";
import { UsersRepository } from "../repositories/users-repository.ts";

interface FetchCourseUsersThatAlreadyConfirmedLoginUseCaseRequest {
  courseId: string
}

type FetchCourseUsersThatAlreadyConfirmedLoginUseCaseResponse = Either<null, {
  users: User[]
}>

export class FetchCourseUsersThatAlreadyConfirmedLoginUseCase {
  constructor(
    private usersRepository: UsersRepository
  ) {}

  async execute({ courseId }: FetchCourseUsersThatAlreadyConfirmedLoginUseCaseRequest): Promise<FetchCourseUsersThatAlreadyConfirmedLoginUseCaseResponse> {
    const users = await this.usersRepository.findManyByCourseIdAndWhoHaveConfirmedLogin({ courseId })
    return right({ users })
  }
}