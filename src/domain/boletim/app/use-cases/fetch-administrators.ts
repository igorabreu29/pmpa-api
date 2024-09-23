import { right, type Either } from "@/core/either.ts";
import type { Administrator } from "../../enterprise/entities/administrator.ts";
import type { AdministratorsRepository } from "../repositories/administrators-repository.ts";

interface FetchAdministratorsUseCaseRequest {
  page: number
  cpf?: string
  username?: string
  isEnabled?: boolean
}

type FetchAdministratorsUseCaseResponse = Either<null, {
    administrators: Administrator[]
    pages: number
    totalItems: number
  }
>

export class FetchAdministratorsUseCase {
  constructor(
    private administratorsRepository: AdministratorsRepository
  ) {}

  async execute({ page, cpf, username, isEnabled = true }: FetchAdministratorsUseCaseRequest): Promise<FetchAdministratorsUseCaseResponse> {
    const { administrators, pages, totalItems } = await this.administratorsRepository.findMany({ page, cpf, username, isEnabled })

    return right({
      administrators,
      pages,
      totalItems
    })
  }
}