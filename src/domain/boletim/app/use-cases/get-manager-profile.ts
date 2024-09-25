import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ManagersRepository } from "../repositories/managers-repository.ts"
import { Either, left, right } from "@/core/either.ts"
import { ManagerDetails } from "../../enterprise/entities/value-objects/manager-details.ts"

interface GetManagerProfileUseCaseRequest {
  id: string
}

type GetManagerProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    manager: ManagerDetails
  }
>

export class GetManagerProfileUseCase {
  constructor (
    private managersRepository: ManagersRepository
  ) {}
  
  async execute({ id }: GetManagerProfileUseCaseRequest): Promise<GetManagerProfileUseCaseResponse> {
    const manager = await this.managersRepository.findDetailsById(id)
    if (!manager) return left(new ResourceNotFoundError('Gerente não encontrado!'))
      
    return right({
      manager
    })
  }
}