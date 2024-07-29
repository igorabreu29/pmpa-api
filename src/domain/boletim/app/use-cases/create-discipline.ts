import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { DisciplinesRepository } from "../repositories/disciplines-repository.ts"
import { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"

interface CreateDisciplineUseCaseRequest {
  name: string
}

type CreateDisciplineUseCaseResponse = Either<ResourceAlreadyExistError | InvalidNameError, null>

export class CreateDisciplineUseCase {
  constructor(
    private disciplinesRepository: DisciplinesRepository
  ) {}

  async execute({ name }: CreateDisciplineUseCaseRequest): Promise<CreateDisciplineUseCaseResponse> {
    const disciplineAlreadyExist = await this.disciplinesRepository.findByName(name)
    if (disciplineAlreadyExist) return left(new ResourceAlreadyExistError('Discipline already exist.'))

    const nameOrError = Name.create(name)
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const disciplineOrError = Discipline.create({ name: nameOrError.value })
    if (disciplineOrError.isLeft()) return left(disciplineOrError.value)

    const discipline = disciplineOrError.value
    await this.disciplinesRepository.create(discipline)
    
    return right(null)
  }
}