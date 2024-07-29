import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";

interface ChangeStudentStatusUseCaseRequest {
  id: string
  status: boolean

  role: Role
}

type ChangeStudentStatusUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class ChangeStudentStatusUseCase {
  constructor (
    private studentsRepository: StudentsRepository
  ) {}

  async execute({ id, status, role }: ChangeStudentStatusUseCaseRequest): Promise<ChangeStudentStatusUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    student.active = status
    await this.studentsRepository.save(student)

    return right(null)
  }
}