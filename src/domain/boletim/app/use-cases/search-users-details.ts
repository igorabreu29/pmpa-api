import { Either, left, right } from "@/core/either.ts";
import { ManagerDetails } from "../../enterprise/entities/value-objects/manager-details.ts";
import { StudentDetails } from "../../enterprise/entities/value-objects/student-details.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { DevelopersRepository } from "../repositories/developers-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import { Administrator } from "../../enterprise/entities/administrator.ts";

interface SearchUsersDetailsUseCaseRequest {
  developerId: string
  query: string
  page: number
}

type SearchUsersDetailsUseCaseResponse = Either<ResourceNotFoundError, {
  students: StudentDetails[]
  managers: ManagerDetails[]
  administrators: Administrator[]
}>

export class SearchUsersDetailsUseCase {
  constructor(
    private developersRepository: DevelopersRepository,
    private administratorsRepository: AdministratorsRepository,
    private managersRepository: ManagersRepository,
    private studentsRepository: StudentsRepository,
  ) {}

  async execute({ developerId, query, page }: SearchUsersDetailsUseCaseRequest): Promise<SearchUsersDetailsUseCaseResponse> {
    const developer = await this.developersRepository.findById(developerId)
    if (!developer) return left(new ResourceNotFoundError('Developer not found.'))

    const [students, managers, administrators] = await Promise.all([
      this.studentsRepository.searchManyDetails({ query, page }), 
      this.managersRepository.searchManyDetails({ query, page }),
      this.administratorsRepository.searchManyDetails({ query, page })
    ])

    return right({
      students,
      managers,
      administrators
    }) 
  }
} 