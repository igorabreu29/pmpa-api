import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface ChangeManagerStatusUseCaseRequest {
  id: string
  status: boolean

  role: Role
}

type ChangeManagerStatusUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class ChangeManagerStatusUseCase {
  constructor (
    private managersRepository: ManagersRepository
  ) {}

  async execute({ id, status, role }: ChangeManagerStatusUseCaseRequest): Promise<ChangeManagerStatusUseCaseResponse> {
    if (role === 'student' || role === 'manager') return left(new NotAllowedError())

    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Manager not found.'))


    manager.active = status
    await this.managersRepository.save(manager)

    return right(null)
  }
}