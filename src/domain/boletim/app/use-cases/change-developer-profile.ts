import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { DevelopersRepository } from "../repositories/developers-repository.ts";

interface ChangeDeveloperProfileUseCaseRequest {
  id: string
  username?: string
  email?: string
  password?: string
}

type ChangeDeveloperProfileUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError
  | InvalidEmailError
  | InvalidBirthdayError
  | InvalidPasswordError, null>

export class ChangeDeveloperProfileUseCase {
  constructor(
    private developersRepository: DevelopersRepository
  ) {}

  async execute({ id, username, email, password }: ChangeDeveloperProfileUseCaseRequest): Promise<ChangeDeveloperProfileUseCaseResponse> {
    const developer = await this.developersRepository.findById(id)
    if (!developer) return left(new ResourceNotFoundError('Developer not found.'))

    const nameOrError = Name.create(username ?? developer.username.value)
    const emailOrError = Email.create(email ?? developer.email.value)
    const passwordOrError = Password.create(password ?? developer.passwordHash.value)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)

    developer.username = nameOrError.value
    developer.email = emailOrError.value
    developer.passwordHash = passwordOrError.value

    await this.developersRepository.save(developer)

    return right(null)
  }
}