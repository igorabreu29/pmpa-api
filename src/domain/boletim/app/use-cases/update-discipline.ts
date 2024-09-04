import { left, right, type Either } from "@/core/either.ts";
import type { DisciplinesRepository } from "../repositories/disciplines-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface UpdateDisciplineUseCaseRequest {
  id: string
  name?: string

  role: Role
}

type UpdateDisciplineUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError
  | NotAllowedError, null>

export class UpdateDisciplineUseCase {
  constructor(
    private disciplinesRepository: DisciplinesRepository
  ) {}

  async execute({
    id,
    name,
    role
  }: UpdateDisciplineUseCaseRequest): Promise<UpdateDisciplineUseCaseResponse> {
    if (!['admin', 'dev'].includes(role)) return left(new NotAllowedError())

    const discipline = await this.disciplinesRepository.findById(id)
    if (!discipline) return left(new ResourceNotFoundError('Discipline not found.'))

    const nameOrError = Name.create(name ?? discipline.name.value)
    if (nameOrError.isLeft()) return left(nameOrError.value)

    discipline.name = nameOrError.value

    await this.disciplinesRepository.save(discipline)

    return right(null)
  }
}