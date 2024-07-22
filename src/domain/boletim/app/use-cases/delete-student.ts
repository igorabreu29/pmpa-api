import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import type { StudentsRepository } from "../repositories/students-repository.ts";

interface DeleteStudentUseCaseRequest {
  id: string
  role: string
}

type DeleteStudentUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError,
  null
>

export class DeleteStudentUseCase {
  constructor(
    private studentsRepository: StudentsRepository,
  ) {}

  async execute({ id, role }: DeleteStudentUseCaseRequest): Promise<DeleteStudentUseCaseResponse> {
    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    if (role === 'student') return left(new NotAllowedError())

    await this.studentsRepository.delete(student)
    return right(null)
  }
}