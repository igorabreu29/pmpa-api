import { Either, right } from "@/core/either.ts";
import { SearchsRepository } from "../repositories/searchs-repository.ts";
import { Search } from "../../enterprise/entities/search.ts";
import { Role } from "../../enterprise/entities/authenticate.ts";

interface SearchUseCaseRequest {
  query: string
  page: number
  role: Role
}

type SearchUseCaseResponse = Either<null, {
  searchs: Search[]
  pages: number
  totalItems: number
}>

export class SearchUseCase {
  constructor(
    private searchsRepository: SearchsRepository
  ) {}

  async execute({ query, page, role }: SearchUseCaseRequest): Promise<SearchUseCaseResponse> {
    const { searchs, pages, totalItems } = await this.searchsRepository.searchManyDetails({
      page,
      query,
      role
    })

    return right({
      searchs,
      pages,
      totalItems
    })
  }
} 