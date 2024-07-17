import { Either, left } from "@/core/either.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";

interface ChangeStudentProfileUseCaseRequest {
  studentId: string
  username?: string
  email?: string
  password?: string
  avatarUrl?: string
}

type ChangeStudentProfileUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError
  | InvalidEmailError
  | InvalidPasswordError, null>

export class ChangeStudentProfileUseCase {
  constructor(
    private studentsRepository: StudentsRepository
  ) {}

  async execute({ studentId, username, email, password, avatarUrl }: ChangeStudentProfileUseCaseRequest) {
    const student = await this.studentsRepository.findById(studentId)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    const nameOrError = Name.create(username)
    const emailOrError = Email.create(email)
    const passwordOrError = Password.create(password)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(nameOrError.value)
    if (passwordOrError.isLeft()) return left(nameOrError.value)

    // student.username = nameOrError.value ?? s
    student.email = emailOrError.value
    student.passwordHash = passwordOrError.value
  }
}