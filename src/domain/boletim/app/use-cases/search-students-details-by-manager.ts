import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";

interface SearchStudentsDetailsManagerUseCaseRequest {
  managerId: string
  query: string
  page: number
}

type SearchStudentsDetailsManagerUseCaseResponse = Either<ResourceNotFoundError, {
  students: {
    studentsByPole: StudentCourseDetails[]
  }[]
}>

export class SearchStudentsDetailsManagerUseCase {
  constructor (
    private managersRepository: ManagersRepository,
    private studentsPolesRepository: StudentsPolesRepository
  ) {}

  async execute({ managerId, query, page }: SearchStudentsDetailsManagerUseCaseRequest): Promise<SearchStudentsDetailsManagerUseCaseResponse> {
    const manager = await this.managersRepository.findDetailsById(managerId)
    if (!manager) return left(new ResourceNotFoundError('Manager not found.'))

    const students = await Promise.all(manager.poles.map(async (pole) => {
      const studentsByPole = await this.studentsPolesRepository.searchManyDetailsByPoleId({ poleId: pole.id.toValue(), query, page })
      return {
        studentsByPole
      }
    }))

    return right({
      students
    })
  }
}