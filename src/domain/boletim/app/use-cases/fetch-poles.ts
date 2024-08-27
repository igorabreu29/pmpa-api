import { right, type Either } from "@/core/either.ts";
import type { Pole } from "../../enterprise/entities/pole.ts";
import type { PolesRepository } from "../repositories/poles-repository.ts";

type FetchPolesUseCaseResponse = Either<null, {
  poles: Pole[]
}>
 
export class FetchPolesUseCase {
  constructor(
    private polesRepository: PolesRepository
  ) {}

  async execute(): Promise<FetchPolesUseCaseResponse> {
    const poles = await this.polesRepository.findMany()

    return right({
      poles,
    })
  }
}