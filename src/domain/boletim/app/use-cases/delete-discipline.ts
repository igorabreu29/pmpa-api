import { left, right, type Either } from "@/core/either.ts";
import type { DisciplinesRepository } from "../repositories/disciplines-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface DeleteDisciplineUseCaseRequest {
  id: string
}

type DeleteDisciplineUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteDisciplineUseCase {
  constructor(
    private disciplinesRepository: DisciplinesRepository
  ) {}

  async execute({
    id,
  }: DeleteDisciplineUseCaseRequest): Promise<DeleteDisciplineUseCaseResponse> {
    const discipline = await this.disciplinesRepository.findById(id)
    if (!discipline) return left(new ResourceNotFoundError('Discipline not found.'))

    await this.disciplinesRepository.delete(discipline)

    return right(null)
  }
}