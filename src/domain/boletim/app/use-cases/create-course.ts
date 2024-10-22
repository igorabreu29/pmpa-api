import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { Course, Formula } from "@/domain/boletim/enterprise/entities/course.ts"
import { CoursesPoleRepository } from "../repositories/courses-poles-repository.ts"
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts"
import { CoursePole } from "../../enterprise/entities/course-pole.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { CourseDiscipline } from "../../enterprise/entities/course-discipline.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import { EndsAt } from "../../enterprise/entities/value-objects/ends-at.ts"
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"
import type { InvalidDateError } from "@/core/errors/domain/invalid-date.ts"

interface CreateCourseUseCaseRequest {
  formula: Formula
  name: string
  imageUrl: string
  startAt?: Date
  endsAt: Date
  isPeriod: boolean

  conceptType?: number
  decimalPlaces?: number
}

type CreateCourseUseCaseResponse = Either<
   | ResourceAlreadyExistError
   | InvalidNameError
   | InvalidDateError,
   {
    id: UniqueEntityId
   }
  >

export class CreateCourseUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
  ) {}

  async execute({ formula, name, imageUrl, startAt, endsAt, isPeriod, conceptType, decimalPlaces }: CreateCourseUseCaseRequest): Promise<CreateCourseUseCaseResponse> {
    const courseAlreadyExist = await this.coursesRepository.findByName(name)
    if (courseAlreadyExist) return left(new ResourceAlreadyExistError('Curso já presente na plataforma.'))

    const nameOrError = Name.create(name)
    const endsAtOrError = EndsAt.create(endsAt)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (endsAtOrError.isLeft()) return left(endsAtOrError.value)

    const courseOrError = Course.create({
      formula, 
      name: nameOrError.value, 
      imageUrl, 
      startAt,
      endsAt: endsAtOrError.value,
      isPeriod,
      conceptType,
      decimalPlaces
    })
    if (courseOrError.isLeft()) return left(courseOrError.value)
      
    const course = courseOrError.value
    await this.coursesRepository.create(course)

    return right({
      id: course.id
    })
  }
}