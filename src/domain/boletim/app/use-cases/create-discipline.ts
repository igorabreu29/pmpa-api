import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { DisciplinesRepository } from "../repositories/disiciplines-repository.ts"
import { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts"

interface CreateDisciplineUseCaseRequest {
  name: string
}

type CreateDisciplineUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreateDisciplineUseCase {
  constructor(
    private disciplinesRepository: DisciplinesRepository
  ) {}

  async execute({ name }: CreateDisciplineUseCaseRequest): Promise<CreateDisciplineUseCaseResponse> {
    const disciplineAlreadyExist = await this.disciplinesRepository.findByName(name)
    if (disciplineAlreadyExist) return left(new ResourceAlreadyExistError('Discipline already present on the platform.'))

    const discipline = Discipline.create({ name })
    await this.disciplinesRepository.create(discipline)
    
    return right(null)
  }
}