import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";

interface ChangeUserStatusRequest {
  id: string
  status: boolean
}

type ChangeUserStatusResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class ChangeStudentStatusUseCase {
  constructor (
    private studentsRepository: StudentsRepository
  ) {}

  async execute({ id, status }: ChangeUserStatusRequest): Promise<ChangeUserStatusResponse> {
    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    student.active = status
    await this.studentsRepository.save(student)

    return right(null)
  }
}