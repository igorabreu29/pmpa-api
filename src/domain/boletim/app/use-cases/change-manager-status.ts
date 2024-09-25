import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";

interface ChangeManagerStatusUseCaseRequest {
  id: string
  courseId: string
  status: boolean

  role: Role
}

type ChangeManagerStatusUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class ChangeManagerStatusUseCase {
  constructor (
    private managersRepository: ManagersRepository,
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository
  ) {}

  async execute({ id, status, courseId, role }: ChangeManagerStatusUseCaseRequest): Promise<ChangeManagerStatusUseCaseResponse> {
    if (role === 'student' || role === 'manager') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Gerente não encontrado.'))

    const managerCourse = await this.managerCoursesRepository.findByManagerIdAndCourseId({
       courseId,
       managerId: id
    })
    if (!managerCourse) return left(new ResourceNotFoundError('Gerente não está presente no curso.'))

    managerCourse.isActive = status
    await this.managerCoursesRepository.updateStatus(managerCourse)

    return right(null)
  }
}