import { left, right, type Either } from "@/core/either.ts";
import type { DisciplinesRepository } from "../repositories/disciplines-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface DeleteDisciplineUseCaseRequest {
  id: string

  role: Role
}

type DeleteDisciplineUseCaseResponse = Either<
 | ResourceNotFoundError
 | NotAllowedError, null>

export class DeleteDisciplineUseCase {
  constructor(
    private disciplinesRepository: DisciplinesRepository
  ) {}

  async execute({
    id,
    role
  }: DeleteDisciplineUseCaseRequest): Promise<DeleteDisciplineUseCaseResponse> {
    if (!['admin', 'dev'].includes(role)) return left(new NotAllowedError())

    const discipline = await this.disciplinesRepository.findById(id)
    if (!discipline) return left(new ResourceNotFoundError('Disciplina não encontrada!'))

    await this.disciplinesRepository.delete(discipline)

    return right(null)
  }
}