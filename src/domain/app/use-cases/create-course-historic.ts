import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { CourseHistoricRepository } from "../repositories/course-historic-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { CourseHistoric } from "@/domain/enterprise/entities/course-historic.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface CreateCourseHistoricUseCaseRequest {
  courseId: string
  className: string
  startDate: Date
  finishDate: Date
  speechs?: number
  internships?: number
  totalHours?: number
  divisionBoss?: string
  commander?: string
}

type CreateCourseHistoricUseCaseResponse = Either<ResourceNotFoundError, null>

export class CreateCourseHistoricUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseHistoricRepository: CourseHistoricRepository
  ) {}

  async execute({
    courseId,
    className,
    startDate,
    finishDate, 
    speechs,
    internships,
    totalHours,
    divisionBoss,
    commander
  }: CreateCourseHistoricUseCaseRequest): Promise<CreateCourseHistoricUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))
    if (finishDate.getTime() < startDate.getTime()) return left(new ConflictError('Conflict between dates. Finish Date cannot be less than Start Date.'))
      
    const courseHistoric = CourseHistoric.create({
      courseId: new UniqueEntityId(courseId),
      className,
      startDate,
      finishDate,
      speechs,
      internships,
      totalHours,
      divisionBoss, 
      commander
    })
    await this.courseHistoricRepository.create(courseHistoric)

    return right(null)
  }
}