import { Either, left, right } from "@/core/either.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";

interface CreatePoleUseCaseRequest {
  name: string
}

type CreatePoleUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreatePoleUseCase {
  constructor(
    private polesRepository: InMemoryPolesRepository
  ) {}

  async execute({ name }: CreatePoleUseCaseRequest): Promise<CreatePoleUseCaseResponse> {
    const poleAlreadyExist = await this.polesRepository.findByName(name)
    if (poleAlreadyExist) return left(new ResourceAlreadyExistError('Pole already exist.'))

    const pole = Pole.create({
      name
    })
    
    await this.polesRepository.create(pole)
    return right(null)
  } 
}