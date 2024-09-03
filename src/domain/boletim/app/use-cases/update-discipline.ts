import { left, right, type Either } from "@/core/either.ts";
import type { DisciplinesRepository } from "../repositories/disciplines-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";

interface UpdateDisciplineUseCaseRequest {
  id: string
  name?: string
}

type UpdateDisciplineUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError, null>

export class UpdateDisciplineUseCase {
  constructor(
    private disciplinesRepository: DisciplinesRepository
  ) {}

  async execute({
    id,
    name
  }: UpdateDisciplineUseCaseRequest): Promise<UpdateDisciplineUseCaseResponse> {
    const discipline = await this.disciplinesRepository.findById(id)
    if (!discipline) return left(new ResourceNotFoundError('Discipline not found.'))

    const nameOrError = Name.create(name ?? discipline.name.value)
    if (nameOrError.isLeft()) return left(nameOrError.value)

    discipline.name = nameOrError.value

    await this.disciplinesRepository.save(discipline)

    return right(null)
  }
}