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
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";

interface ChangeDeveloperProfileUseCaseRequest {
  id: string
  username?: string
  email?: string
  password?: string
  birthday?: Date
  civilId?: string
  militaryId?: string
  motherName?: string
  fatherName?: string
  county?: string
  state?: string
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

  async execute({ 
    id, 
    username, 
    email, 
    password, 
    birthday,
    civilId,
    militaryId,
    fatherName,
    motherName,
    county,
    state
  }: ChangeDeveloperProfileUseCaseRequest): Promise<ChangeDeveloperProfileUseCaseResponse> {
    const developer = await this.developersRepository.findById(id)
    if (!developer) return left(new ResourceNotFoundError('Desenvolvedor não encontrado.'))

    const nameOrError = Name.create(username ?? developer.username.value)
    const emailOrError = Email.create(email ?? developer.email.value)
    const passwordOrError = Password.create(password ?? developer.passwordHash.value)
    const birthdayOrError = Birthday.create(birthday ?? developer.birthday.value)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    if (password) {
      const isEqualsPassword = await developer.passwordHash.compare(password)
      if (!isEqualsPassword) await passwordOrError.value.hash()
    }

    developer.username = nameOrError.value
    developer.email = emailOrError.value
    developer.passwordHash = passwordOrError.value
    developer.birthday = birthdayOrError.value
    developer.civilId = civilId ?? developer.civilId
    developer.militaryId = militaryId ?? developer.militaryId
    developer.parent = {
      motherName: motherName ?? developer.parent?.motherName,
      fatherName: fatherName ?? developer.parent?.fatherName
    }
    developer.state = state ?? developer.state
    developer.county = county ?? developer.county
      

    await this.developersRepository.save(developer)

    return right(null)
  }
}