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

interface CreateCourseUseCaseRequest {
  formula: Formula
  name: string
  imageUrl: string
  endsAt: Date
  isPeriod: boolean
  poleIds: string[]
  disciplines: {
    id: string
    expected: string
    hours: number
    module: number
  }[]
}

type CreateCourseUseCaseResponse = Either<
   | ResourceAlreadyExistError
   | InvalidNameError,
   null
  >

export class CreateCourseUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private coursesPolesRepository: CoursesPoleRepository,
    private coursesDisciplinesRepository: CoursesDisciplinesRepository
  ) {}

  async execute({ formula, name, imageUrl, endsAt, poleIds, disciplines, isPeriod }: CreateCourseUseCaseRequest): Promise<CreateCourseUseCaseResponse> {
    const courseAlreadyExist = await this.coursesRepository.findByName(name)
    if (courseAlreadyExist) return left(new ResourceAlreadyExistError('Course already present on the platform.'))

    const nameOrError = Name.create(name)
    const endsAtOrError = EndsAt.create(endsAt)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (endsAtOrError.isLeft()) return left(endsAtOrError.value)

    const courseOrError = Course.create({
      formula, 
      name: nameOrError.value, 
      imageUrl, 
      endsAt: endsAtOrError.value,
      isPeriod
    })
    if (courseOrError.isLeft()) return left(courseOrError.value)
      
    const course = courseOrError.value
    await this.coursesRepository.create(course)

    const coursePoles = poleIds.map(poleId => {
      return CoursePole.create({
        courseId: course.id,
        poleId: new UniqueEntityId(poleId)
      })
    })
    await this.coursesPolesRepository.createMany(coursePoles)

    const courseDisciplines = disciplines.map(discipline => {
      return CourseDiscipline.create({
        courseId: course.id,
        disciplineId: new UniqueEntityId(discipline.id),
        ...discipline
      })
    })
    await this.coursesDisciplinesRepository.createMany(courseDisciplines)

    return right(null)
  }
}