import { right, type Either } from "@/core/either.ts";
import type { Discipline } from "../../enterprise/entities/discipline.ts";
import type { DisciplinesRepository } from "../repositories/disciplines-repository.ts";

interface FetchDisciplinesUseCaseRequest {
  page?: number
}

type FetchDisciplinesUseCaseResponse = Either<null, {
  disciplines: Discipline[],
  pages?: number
  totalItems?: number
}>
 
export class FetchDisciplinesUseCase {
  constructor(
    private disciplinesRepository: DisciplinesRepository
  ) {}

  async execute({ page }: FetchDisciplinesUseCaseRequest): Promise<FetchDisciplinesUseCaseResponse> {
    const { disciplines, pages, totalItems } = await this.disciplinesRepository.findMany(page)

    return right({
      disciplines,
      pages,
      totalItems
    })
  }
}