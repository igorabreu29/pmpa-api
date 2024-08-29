import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";

interface ChangeAdministratorProfileUseCaseRequest {
  id: string
  username?: string
  email?: string
  password?: string
  birthday?: Date
  civilId?: string
  militaryId?: string
  fatherName?: string
  motherName?: string
  county?: string
  state?: string
}

type ChangeAdministratorProfileUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError
  | InvalidEmailError
  | InvalidBirthdayError
  | InvalidPasswordError, null>

export class ChangeAdministratorProfileUseCase {
  constructor(
    private administratorsRepository: AdministratorsRepository
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
  }: ChangeAdministratorProfileUseCaseRequest): Promise<ChangeAdministratorProfileUseCaseResponse> {
    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError('Administrator not found.'))

    const nameOrError = Name.create(username ?? administrator.username.value)
    const emailOrError = Email.create(email ?? administrator.email.value)
    const passwordOrError = Password.create(password ?? administrator.passwordHash.value)
    const birthdayOrError = Birthday.create(birthday ?? administrator.birthday.value)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    if (password) {
      const isEqualsPassword = await administrator.passwordHash.compare(password)
      if (!isEqualsPassword) await passwordOrError.value.hash()
    }

    administrator.username = nameOrError.value
    administrator.email = emailOrError.value
    administrator.passwordHash = passwordOrError.value
    administrator.civilId = civilId ?? administrator.civilId
    administrator.militaryId = militaryId ?? administrator.militaryId
    administrator.parent = {
      fatherName: fatherName ?? administrator.parent?.fatherName,
      motherName: motherName ?? administrator.parent?.motherName
    }
    administrator.birthday = birthdayOrError.value
    administrator.state = state ?? administrator.state
    administrator.county = county ?? administrator.county

    await this.administratorsRepository.save(administrator)

    return right(null)
  }
}