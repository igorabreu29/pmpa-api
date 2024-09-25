import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { DisciplinesRepository } from "../repositories/disciplines-repository.ts"
import { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"
import { Role } from "../../enterprise/entities/authenticate.ts"
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"

interface CreateDisciplineUseCaseRequest {
  name: string
  role: Role
}

type CreateDisciplineUseCaseResponse = Either<ResourceAlreadyExistError | InvalidNameError | NotAllowedError, null>

export class CreateDisciplineUseCase {
  constructor(
    private disciplinesRepository: DisciplinesRepository
  ) {}

  async execute({ name, role }: CreateDisciplineUseCaseRequest): Promise<CreateDisciplineUseCaseResponse> {
    if (!['admin', 'dev'].includes(role)) return left(new NotAllowedError())

    const disciplineAlreadyExist = await this.disciplinesRepository.findByName(name)
    if (disciplineAlreadyExist) return left(new ResourceAlreadyExistError('Disciplina já existente.'))

    const nameOrError = Name.create(name)
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const disciplineOrError = Discipline.create({ name: nameOrError.value })
    if (disciplineOrError.isLeft()) return left(disciplineOrError.value)

    const discipline = disciplineOrError.value
    await this.disciplinesRepository.create(discipline)
    
    return right(null)
  }
}