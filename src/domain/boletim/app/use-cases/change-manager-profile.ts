import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";

interface ChangeManagerProfileUseCaseRequest {
  id: string
  username?: string
  email?: string
  password?: string
  birthday?: Date
}

type ChangeManagerProfileUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError
  | InvalidEmailError
  | InvalidBirthdayError
  | InvalidPasswordError, null>

export class ChangeManagerProfileUseCase {
  constructor(
    private managersRepository: ManagersRepository
  ) {}

  async execute({ id, username, email, password, birthday }: ChangeManagerProfileUseCaseRequest): Promise<ChangeManagerProfileUseCaseResponse> {
    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Manager not found.'))

    const nameOrError = Name.create(username ?? manager.username.value)
    const emailOrError = Email.create(email ?? manager.email.value)
    const passwordOrError = Password.create(password ?? manager.passwordHash.value)
    const birthdayOrError = Birthday.create(birthday ?? manager.birthday.value)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    manager.username = nameOrError.value
    manager.email = emailOrError.value
    manager.passwordHash = passwordOrError.value
    manager.birthday = birthdayOrError.value

    await this.managersRepository.save(manager)

    return right(null)
  }
}