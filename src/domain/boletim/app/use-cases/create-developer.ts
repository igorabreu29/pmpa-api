import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { DevelopersRepository } from "../repositories/developers-repository.ts"
import { Developer } from "../../enterprise/entities/developer.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts"
import { Email } from "../../enterprise/entities/value-objects/email.ts"
import { Password } from "../../enterprise/entities/value-objects/password.ts"

interface CreateDeveloperUseCaseRequest {
  username: string
  email: string
  cpf: string
  password: string
  civilId: number
}

type CreateDeveloperUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreateDeveloperUseCase {
  constructor (
    private developersRepository: DevelopersRepository,
  ) {}

  async execute({ username, email, password, cpf }: CreateDeveloperUseCaseRequest): Promise<CreateDeveloperUseCaseResponse> {
    const nameOrError = Name.create(username)
    const emailOrError = Email.create(email)
    const cpfOrError = CPF.create(cpf)
    const passwordOrError = Password.create(password)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)

    await passwordOrError.value.hash()
    const developerOrError = Developer.create({
      username: nameOrError.value, 
      email: emailOrError.value,
      passwordHash: passwordOrError.value,
      cpf: cpfOrError.value
    })
    if (developerOrError.isLeft()) return left(developerOrError.value)

    const developer = developerOrError.value

    const administratorAlreadyExistWithCPF = await this.developersRepository.findByCPF(cpf)
    if (administratorAlreadyExistWithCPF) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    const userAlreadyExistWithEmail = await this.developersRepository.findByEmail(email)
    if (userAlreadyExistWithEmail) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    await this.developersRepository.create(developer)

    return right(null)
  }
}