import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { DevelopersRepository } from "../repositories/developers-repository.ts"
import { Developer } from "../../enterprise/entities/developer.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts"
import { Email } from "../../enterprise/entities/value-objects/email.ts"
import { Password } from "../../enterprise/entities/value-objects/password.ts"
import type { Role } from "../../enterprise/entities/authenticate.ts"
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts"
import type { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts"
import type { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts"
import type { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts"
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"
import type { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts"

interface CreateDeveloperUseCaseRequest {
  username: string
  email: string
  cpf: string
  password: string
  civilId: number
  birthday: Date

  role: Role
}

type CreateDeveloperUseCaseResponse = Either<
    | ResourceAlreadyExistError
    | InvalidEmailError
    | InvalidCPFError
    | InvalidPasswordError
    | InvalidNameError
    | InvalidBirthdayError
    | NotAllowedError, 
    null
  >

export class CreateDeveloperUseCase {
  constructor (
    private developersRepository: DevelopersRepository,
  ) {}

  async execute({ username, email, password, cpf, role, civilId, birthday }: CreateDeveloperUseCaseRequest): Promise<CreateDeveloperUseCaseResponse> {
    if (role !== 'dev') return left(new NotAllowedError())
    
    const nameOrError = Name.create(username)
    const emailOrError = Email.create(email)
    const cpfOrError = CPF.create(cpf)
    const passwordOrError = Password.create(password)
    const birthdayOrError = Birthday.create(birthday)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    await passwordOrError.value.hash()
    const developerOrError = Developer.create({
      username: nameOrError.value, 
      email: emailOrError.value,
      passwordHash: passwordOrError.value,
      cpf: cpfOrError.value,
      civilId,
      birthday: birthdayOrError.value
    })
    if (developerOrError.isLeft()) return left(developerOrError.value)

    const developer = developerOrError.value

    const developerAlreadyExistWithCPF = await this.developersRepository.findByCPF(cpf)
    if (developerAlreadyExistWithCPF) return left(new ResourceAlreadyExistError('Developer already exist.'))

    const userAlreadyExistWithEmail = await this.developersRepository.findByEmail(email)
    if (userAlreadyExistWithEmail) return left(new ResourceAlreadyExistError('Developer already exist.'))

    await this.developersRepository.create(developer)

    return right(null)
  }
}