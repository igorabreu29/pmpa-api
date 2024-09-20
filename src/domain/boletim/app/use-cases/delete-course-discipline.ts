import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { DisciplinesRepository } from "../repositories/disciplines-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";

interface DeleteCourseDisciplineUseCaseRequest {
  courseId: string
  disciplineId: string
}

type DeleteCourseDisciplineUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteCourseDisciplineUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private coursesDisciplinesRepository: CoursesDisciplinesRepository
  ) {}

  async execute({
    courseId,
    disciplineId,
  }: DeleteCourseDisciplineUseCaseRequest): Promise<DeleteCourseDisciplineUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const discipline = await this.disciplinesRepository.findById(disciplineId)
    if (!discipline) return left(new ResourceNotFoundError('Discipline not found.'))

    const courseDiscipline = await this.coursesDisciplinesRepository.findByCourseAndDisciplineId({ courseId, disciplineId })
    if (!courseDiscipline) return left(new ResourceNotFoundError('Course discipline not found.'))

    await this.coursesDisciplinesRepository.delete(courseDiscipline)

    return right(null)
  }
}