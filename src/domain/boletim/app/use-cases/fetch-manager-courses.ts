import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import { ManagerWithCourse } from "../../enterprise/entities/value-objects/manager-with-course.ts";

interface FetchManagerCoursesUseCaseRequest {
  managerId: string
  page: number
  perPage: number
}

type FetchManagerCoursesUseCaseResponse = Either<ResourceNotFoundError, {
  courses: ManagerWithCourse[],
  pages: number,
  totalItems: number
}>

export class FetchManagerCoursesUseCase {
  constructor(
    private managersRepository: ManagersRepository,
    private managersCoursesRepository: ManagersCoursesRepository
  ) {}

  async execute({ managerId, page, perPage }: FetchManagerCoursesUseCaseRequest): Promise<FetchManagerCoursesUseCaseResponse> {
    const manager = await this.managersRepository.findById(managerId)
    if (!manager) return left(new ResourceNotFoundError('Gerente não encontrado.'))

    const { managerCourses, pages, totalItems } = await this.managersCoursesRepository.findManyByManagerIdWithCourse({ managerId, page, perPage })
    
    return right({ courses: managerCourses, pages, totalItems })
  }
}