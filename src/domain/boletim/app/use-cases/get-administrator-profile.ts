import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { Either, left, right } from "@/core/either.ts"
import { AdministratorsRepository } from "../repositories/administrators-repository.ts"
import { Administrator } from "../../enterprise/entities/administrator.ts"

interface GetAdministratorProfileUseCaseRequest {
  id: string
}

type GetAdministratorProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    administrator: Administrator
  }
>

export class GetAdministratorProfileUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository
  ) {}
  
  async execute({ id }: GetAdministratorProfileUseCaseRequest): Promise<GetAdministratorProfileUseCaseResponse> {
    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError())
      
    return right({
      administrator
    })
  }
}