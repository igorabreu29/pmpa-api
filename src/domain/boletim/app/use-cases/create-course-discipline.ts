import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { DisciplinesRepository } from "../repositories/disiciplines-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";
import { CourseDiscipline } from "../../enterprise/entities/course-discipline.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";

interface CreateCourseDisciplineRequest {
  courseId: string
  disciplineId: string
  module: number
  hours: number
  expected: string
  weight: number
}

type CreateCourseDisciplineResponse = Either<ResourceNotFoundError | ResourceAlreadyExistError, null>

export class CreateCourseDiscipline {
  constructor (
    private coursesRepository: CoursesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private coursesDisciplinesRepository: CoursesDisciplinesRepository
  ) {}

  async execute({
    courseId,
    disciplineId,
    expected,
    hours,
    module,
    weight
  }: CreateCourseDisciplineRequest): Promise<CreateCourseDisciplineResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const discipline = await this.disciplinesRepository.findById(disciplineId)
    if (!discipline) return left(new ResourceNotFoundError('Discipline not found.'))

    const courseDisciplineAlreadyExist = await this.coursesDisciplinesRepository.findByCourseIdAndDisciplineId({ courseId, disciplineId })
    if (courseDisciplineAlreadyExist) return left(new ResourceAlreadyExistError())

    const courseDiscipline = CourseDiscipline.create({
      courseId: course.id,
      disciplineId: discipline.id,
      expected,
      hours,
      module,
      weight
    })
    await this.coursesDisciplinesRepository.create(courseDiscipline)

    return right(null)
  }
}