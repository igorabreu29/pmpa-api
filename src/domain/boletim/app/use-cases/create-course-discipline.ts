import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { DisciplinesRepository } from "../repositories/disciplines-repository.ts";
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
}

type CreateCourseDisciplineResponse = Either<ResourceNotFoundError | ResourceAlreadyExistError, null>

export class CreateCourseDisciplineUseCase {
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
    module
  }: CreateCourseDisciplineRequest): Promise<CreateCourseDisciplineResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const discipline = await this.disciplinesRepository.findById(disciplineId)
    if (!discipline) return left(new ResourceNotFoundError('Disciplina não encontrada!'))

    const courseDisciplineAlreadyExist = await this.coursesDisciplinesRepository.findByCourseAndDisciplineId({ courseId, disciplineId })
    if (courseDisciplineAlreadyExist) return left(new ResourceAlreadyExistError('Disciplina já presente no curso.'))

    const courseDiscipline = CourseDiscipline.create({
      courseId: course.id,
      disciplineId: discipline.id,
      expected,
      hours,
      module
    })
    await this.coursesDisciplinesRepository.create(courseDiscipline)

    return right(null)
  }
}