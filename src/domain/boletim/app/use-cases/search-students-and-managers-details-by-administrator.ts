import { Either, left, right } from "@/core/either.ts";
import { ManagerDetails } from "../../enterprise/entities/value-objects/manager-details.ts";
import { StudentDetails } from "../../enterprise/entities/value-objects/student-details.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface SearchStudentsAndManagersDetailsManagerUseCaseRequest {
  administratorId: string
  query: string
  page: number
}

type SearchStudentsAndManagersDetailsManagerUseCaseResponse = Either<ResourceNotFoundError, {
  students: StudentDetails[]
  managers: ManagerDetails[]
}>

export class SearchStudentsAndManagersDetailsManagerUseCase {
  constructor(
    private administratorsRepository: AdministratorsRepository,
    private studentsRepository: StudentsRepository,
    private managersRepository: ManagersRepository
  ) {}

  async execute({ administratorId, query, page }: SearchStudentsAndManagersDetailsManagerUseCaseRequest): Promise<SearchStudentsAndManagersDetailsManagerUseCaseResponse> {
    const administrator = await this.administratorsRepository.findById(administratorId)
    if (!administrator) return left(new ResourceNotFoundError('Administrator not found.'))

    const [students, managers] = await Promise.all([
      this.studentsRepository.searchManyDetails({ query, page }), 
      this.managersRepository.searchManyDetails({ query, page })
    ])

    return right({
      students,
      managers
    }) 
  }
} 