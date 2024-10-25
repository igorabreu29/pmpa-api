import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import type { StudentsRepository } from "../repositories/students-repository.ts";
import { StudentEvent } from "../../enterprise/events/student-event.ts";

interface DeleteStudentUseCaseRequest {
  userId: string
  userIp: string

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

  async execute({ id, role, userId, userIp }: DeleteStudentUseCaseRequest): Promise<DeleteStudentUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())
      
    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Estudante não encontrado.'))

    student.addDomainStudentEvent(
      new StudentEvent({
        reporterId: userId,
        reporterIp: userIp,
        student
      })
    )
      
    await this.studentsRepository.delete(student)

    return right(null)
  }
}