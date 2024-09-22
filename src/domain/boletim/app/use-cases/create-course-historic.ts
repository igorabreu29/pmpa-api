import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { CourseHistoricRepository } from "../repositories/course-historic-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import type { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";

interface CreateCourseHistoricUseCaseRequest {
  courseId: string
  className: string
  startDate: Date
  finishDate: Date
  speechs?: number
  internships?: number
  divisionBoss?: string
  commander?: string
}

type CreateCourseHistoricUseCaseResponse = Either<ResourceNotFoundError | ResourceAlreadyExistError | ConflictError, null>

export class CreateCourseHistoricUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository,
    private courseHistoricRepository: CourseHistoricRepository
  ) {}

  async execute({
    courseId,
    className,
    startDate,
    finishDate, 
    speechs,
    internships,
    divisionBoss,
    commander
  }: CreateCourseHistoricUseCaseRequest): Promise<CreateCourseHistoricUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const courseDisciplines = await this.courseDisciplinesRepository.findManyByCourseIdWithDiscipliine(
      {
        courseId: course.id.toValue()
      }
    )
    
    const courseHasHistoric = await this.courseHistoricRepository.findByCourseId(courseId)
    if (courseHasHistoric) return left(new ResourceAlreadyExistError('This course already has a historic.'))

    if (finishDate.getTime() < startDate.getTime()) return left(new ConflictError('Conflict between dates. Finish Date cannot be less than Start Date.'))

    const totalDisciplinesHours = courseDisciplines.reduce((hours, courseDiscipline) => hours + courseDiscipline.hours, 0)
    const totalHours = 
      speechs && internships ? totalDisciplinesHours + speechs + internships : totalDisciplinesHours 
      
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