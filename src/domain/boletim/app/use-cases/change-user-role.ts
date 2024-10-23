import { Either, left, right } from "@/core/either.ts";
import { Role } from "../../enterprise/entities/authenticate.ts";
import { AuthenticatesRepository } from "../repositories/authenticates-repository.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface ChangeUserRoleUseCaseRequest {
  id: string
  role: Role

  userAccess: Role
}

type ChangeUserRoleUseCaseResponse = Either<NotAllowedError | ResourceNotFoundError, null>

export class ChangeUserRoleUseCase {
  constructor(
    private authenticatesRepository: AuthenticatesRepository
  ) {}

  async execute({ id, role, userAccess }: ChangeUserRoleUseCaseRequest): Promise<ChangeUserRoleUseCaseResponse> {
    if (userAccess !== 'dev') return left(new NotAllowedError('Rota não autorizada!'))

    const user = await this.authenticatesRepository.findById({ id })
    if (!user) return left(new ResourceNotFoundError('Usuário não encontrado!'))

    user.role = role
    await this.authenticatesRepository.save(user)

    return right(null)
  }
}