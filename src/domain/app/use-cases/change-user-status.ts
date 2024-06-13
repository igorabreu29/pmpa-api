import { Either, left, right } from "@/core/either.ts";
import { UsersRepository } from "../repositories/users-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { Role } from "@/domain/enterprise/entities/user.ts";

interface ChangeUserStatusRequest {
  requesterRole: Role
  id: string
  value: boolean
}

type ChangeUserStatusResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class ChangeUserStatus {
  constructor(
    private usersRepository: UsersRepository
  ) {}

  async execute({ requesterRole, id, value }: ChangeUserStatusRequest): Promise<ChangeUserStatusResponse> {
    const user = await this.usersRepository.findById(id)
    if (!user) return left(new ResourceNotFoundError('User not found.'))
    if (requesterRole === 'student') return left(new NotAllowedError('Not allowed.'))

    user.active = value
    this.usersRepository.update(user)

    return right(null)
  }
}