import { Either, left, right } from "@/core/either.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";

interface CreatePoleUseCaseRequest {
  name: string
}

type CreatePoleUseCaseResponse = Either<ResourceAlreadyExistError | InvalidNameError, null>

export class CreatePoleUseCase {
  constructor(
    private polesRepository: InMemoryPolesRepository
  ) {}

  async execute({ name }: CreatePoleUseCaseRequest): Promise<CreatePoleUseCaseResponse> {
    const poleAlreadyExist = await this.polesRepository.findByName(name)
    if (poleAlreadyExist) return left(new ResourceAlreadyExistError('Pole already exist.'))

    const nameOrError = Name.create(name)
    if (nameOrError.isLeft()) return left(nameOrError.value)

    const poleOrError = Pole.create({
      name: nameOrError.value
    })
    if (poleOrError.isLeft()) return left(poleOrError.value)
    
    const pole = poleOrError.value

    await this.polesRepository.create(pole)
    return right(null)
  } 
}