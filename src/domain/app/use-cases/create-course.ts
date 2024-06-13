import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { Course, Formule } from "@/domain/enterprise/entities/course.ts"
import { CourseDiscipline, Expected } from "@/domain/enterprise/entities/course-discipline.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { CourseDisciplinesRepository } from "../repositories/course-discipline-repository.ts"
import { CoursePole } from "@/domain/enterprise/entities/course-pole.ts"
import { CoursePolesRepository } from "../repositories/pole-course-repository.ts"

interface CreateCourseUseCaseRequest {
  formule: Formule
  name: string
  imageUrl: string
  disciplines: {
    id: string
    module: number
    hours: number
    expected: Expected
    weight: number
  }[]
  poleIds: string[]
  modules?: number
  periods?: number
}

type CreateCourseUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreateCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseDisciplinesRepository: CourseDisciplinesRepository,
    private coursePolesRepository: CoursePolesRepository
  ) {}

  async execute({ formule, name, imageUrl, disciplines, modules, periods, poleIds }: CreateCourseUseCaseRequest): Promise<CreateCourseUseCaseResponse> {
    const courseAlreadyExist = await this.coursesRepository.findByName(name)
    if (courseAlreadyExist) return left(new ResourceAlreadyExistError('Course already present on the platform.'))

    const course = Course.create({ formule, name, imageUrl, active: "enabled", modules: modules ?? null, periods: periods ?? null })
    await this.coursesRepository.create(course)

    const courseDisciplines = disciplines.map(discipline => {
      return CourseDiscipline.create({
        courseId: course.id,
        disciplineId: new UniqueEntityId(discipline.id),
        expected: discipline.expected,
        hours: discipline.hours,
        module: discipline.module,
        weight: discipline.weight
      })
    })
    await this.courseDisciplinesRepository.createMany(courseDisciplines)

    const coursePoles = poleIds.map(poleId => {
      return CoursePole.create({
        courseId: course.id,
        poleId: new UniqueEntityId(poleId)
      })
    })
    await this.coursePolesRepository.createMany(coursePoles)

    return right(null)
  }
}