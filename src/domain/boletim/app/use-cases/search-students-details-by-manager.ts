import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import { SearchsRepository } from "../repositories/searchs-repository.ts";
import { Search } from "../../enterprise/entities/search.ts";

interface SearchStudentsDetailsManagerUseCaseRequest {
  managerId: string
  query: string
  page: number
}

type SearchStudentsDetailsManagerUseCaseResponse = Either<ResourceNotFoundError, {
  students: Search[]
  pages: number
  totalItems: number
}>

export class SearchStudentsDetailsManagerUseCase {
  constructor (
    private managersRepository: ManagersRepository,
    private searchsRepository: SearchsRepository
  ) {}

  async execute({ managerId, query, page }: SearchStudentsDetailsManagerUseCaseRequest): Promise<SearchStudentsDetailsManagerUseCaseResponse> {
    const manager = await this.managersRepository.findDetailsById(managerId)
    if (!manager) return left(new ResourceNotFoundError('Gerente não encontrado.'))

    const { searchs: students, pages, totalItems } = await this.searchsRepository.searchManyDetails({
      page,
      query,
      role: 'manager',
      courses: manager.courses.map(({ course, managerCourseId }) => ({
        course,
        searchCourseId: managerCourseId
      })),
      poles: manager.poles.map(({ pole, managerPoleId }) => ({
        pole,
        searchPoleId: managerPoleId
      })),
    })

    return right({
      students,
      pages,
      totalItems
    })
  }
}