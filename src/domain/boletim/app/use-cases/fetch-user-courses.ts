import { Either, left, right } from "@/core/either.ts";
import { UsersRepository } from "../repositories/users-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";

interface FetchUserCoursesUseCaseRequest {
  userId: string
  page: number
  perPage: number
}

type FetchUserCoursesUseCaseResponse = Either<ResourceNotFoundError, {
  courses: Course[],
  pages: number,
  totalItems: number
}>

export class FetchUserCoursesUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute({ userId, page, perPage }: FetchUserCoursesUseCaseRequest): Promise<FetchUserCoursesUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError('User not found.'))

    const { courses, pages, totalItems } = await this.coursesRepository.findManyByUserId({ userId, page, perPage })
    
    return right({ courses, pages, totalItems })
  }
}