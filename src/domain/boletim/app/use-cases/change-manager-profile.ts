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
  civilId?: string
  militaryId?: string
  fatherName?: string
  motherName?: string
  birthday?: Date
  county?: string
  state?: string
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
  }: ChangeManagerProfileUseCaseRequest): Promise<ChangeManagerProfileUseCaseResponse> {
    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Gerente não encontrado.'))

    const nameOrError = Name.create(username ?? manager.username.value)
    const emailOrError = Email.create(email ?? manager.email.value)
    const passwordOrError = Password.create(password ?? manager.passwordHash.value)
    const birthdayOrError = Birthday.create(birthday ?? manager.birthday.value)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    if (password) {
      const isEqualsPassword = await manager.passwordHash.compare(password)
      if (!isEqualsPassword) await passwordOrError.value.hash()
    }

    manager.username = nameOrError.value
    manager.email = emailOrError.value
    manager.passwordHash = passwordOrError.value
    manager.civilId = civilId ?? manager.civilId
    manager.militaryId = militaryId ?? manager.militaryId
    manager.parent = {
      fatherName: fatherName ?? manager.parent?.fatherName,
      motherName: motherName ?? manager.parent?.motherName
    }
    manager.birthday = birthdayOrError.value
    manager.state = state ?? manager.state
    manager.county = county ?? manager.county

    await this.managersRepository.save(manager)

    return right(null)
  }
}