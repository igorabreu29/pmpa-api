import { left, right, type Either } from "@/core/either.ts";
import { Attachment } from "../../enterprise/entities/attachment.ts";
import type { StudentsRepository } from "../repositories/students-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface ChangeStudentAvatarUseCaseRequest {
  id: string
  fileLink: string
}

type ChangeStudentAvatarUseCaseResponse = Either<ResourceNotFoundError, null>

export class ChangeStudentAvatarUseCase {
  constructor (
    private studentsRepository: StudentsRepository
  ) {}

  async execute({ id, fileLink }: ChangeStudentAvatarUseCaseRequest): Promise<ChangeStudentAvatarUseCaseResponse> {
    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Student not found'))

    student.avatarUrl = fileLink
    await this.studentsRepository.save(student)

    return right(null)
  }
}