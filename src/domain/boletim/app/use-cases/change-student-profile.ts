import { Either, left, right } from "@/core/either.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";

interface ChangeStudentProfileUseCaseRequest {
  id: string
  username?: string
  email?: string
  password?: string
  fatherName?: string
  motherName?: string
  birthday?: Date
}

type ChangeStudentProfileUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError
  | InvalidEmailError
  | InvalidBirthdayError
  | InvalidPasswordError, null>

export class ChangeStudentProfileUseCase {
  constructor(
    private studentsRepository: StudentsRepository
  ) {}

  async execute({ id, username, email, password, fatherName, motherName, birthday }: ChangeStudentProfileUseCaseRequest): Promise<ChangeStudentProfileUseCaseResponse> {
    const student = await this.studentsRepository.findById(id)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    const nameOrError = Name.create(username ?? student.username.value)
    const emailOrError = Email.create(email ?? student.email.value)
    const passwordOrError = Password.create(password ?? student.passwordHash.value)
    const birthdayOrError = Birthday.create(birthday ?? student.birthday.value)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    student.username = nameOrError.value
    student.email = emailOrError.value
    student.passwordHash = passwordOrError.value
    student.parent = {
      fatherName: fatherName ?? student.parent?.fatherName,
      motherName: motherName ?? student.parent.motherName
    }
    student.birthday = birthdayOrError.value

    await this.studentsRepository.save(student)

    return right(null)
  }
}