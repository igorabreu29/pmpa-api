import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { Either, left, right } from "@/core/either.ts"
import { Developer } from "../../enterprise/entities/developer.ts"
import { DevelopersRepository } from "../repositories/developers-repository.ts"

interface GetDeveloperProfileUseCaseRequest {
  id: string
}

type GetDeveloperProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    developer: Developer
  }
>

export class GetDeveloperProfileUseCase {
  constructor (
    private developersRepository: DevelopersRepository
  ) {}
  
  async execute({ id }: GetDeveloperProfileUseCaseRequest): Promise<GetDeveloperProfileUseCaseResponse> {
    const developer = await this.developersRepository.findById(id)
    if (!developer) return left(new ResourceNotFoundError())
      
    return right({
      developer
    })
  }
}