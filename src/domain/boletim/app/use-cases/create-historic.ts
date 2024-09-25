import { Either, left, right } from "@/core/either.ts";
import { CourseHistoricRepository } from "../repositories/course-historic-repository.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface CreateHistoricUseCaseRequest {
  courseId: string
  className: string
  startDate: Date
  finishDate: Date
}

type CreateHistoricUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class CreateHistoricUseCase {
  constructor(
    private courseHistoricRepository: CourseHistoricRepository,
    private coursesRepository: CoursesRepository
  ) {}

  async execute({ className, courseId, finishDate, startDate }: CreateHistoricUseCaseRequest): Promise<CreateHistoricUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Não é possível gerar o histórico escolar de um curso não existente.'))
    if (finishDate.getTime() < startDate.getTime()) return left(new NotAllowedError('Conflito entre as datas de ínicio e término do curso.'))

    const courseHistoric = CourseHistoric.create({
      className,
      courseId: new UniqueEntityId(courseId),
      startDate,
      finishDate,
    })
    await this.courseHistoricRepository.create(courseHistoric)

    return right(null)
  }
}