import { right, type Either } from "@/core/either.ts";
import type { Pole } from "../../enterprise/entities/pole.ts";
import type { PolesRepository } from "../repositories/poles-repository.ts";

interface FetchPolesUseCaseRequest {
  page: number
}

type FetchPolesUseCaseResponse = Either<null, {
  poles: Pole[],
  pages: number
  totalItems: number
}>
 
export class FetchPolesUseCase {
  constructor(
    private polesRepository: PolesRepository
  ) {}

  async execute({ page }: FetchPolesUseCaseRequest): Promise<FetchPolesUseCaseResponse> {
    const { poles, pages, totalItems } = await this.polesRepository.findMany(page)

    return right({
      poles,
      pages,
      totalItems
    })
  }
}