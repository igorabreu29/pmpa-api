import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { UserPolesRepository } from "../repositories/user-poles-repository.ts"
import { UserPole } from "@/domain/enterprise/entities/user-pole.ts"

interface AssignUserToPoleUseCaseRequest {
  userId: string
  poleId: string
}

type AssignUserToPoleUseCaseResponse = Either<ResourceAlreadyExistError | ResourceNotFoundError, null>

export class AssignUserToPoleUseCase {
  constructor(
    private userPolesRepository: UserPolesRepository
  ) {}

  async execute({ userId, poleId }: AssignUserToPoleUseCaseRequest): Promise<AssignUserToPoleUseCaseResponse> {
    const userAlreadyExistOnThePoles = await this.userPolesRepository.findByPoleIdAndUserId({ poleId, userId })
    if (userAlreadyExistOnThePoles) return left(new ResourceAlreadyExistError('User already present on the pole.'))

    const userCourse = UserPole.create({
      userId: new UniqueEntityId(userId),
      poleId: new UniqueEntityId(poleId),
    })
    await this.userPolesRepository.create(userCourse)

    return right(null)
  }
}