import { Either, left, right } from "@/core/either.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { AdministratorsRepository } from "../repositories/administrators-repository.ts"
import { Administrator } from "../../enterprise/entities/administrator.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts"
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts"
import { Email } from "../../enterprise/entities/value-objects/email.ts"
import { Password } from "../../enterprise/entities/value-objects/password.ts"

interface CreateAdminUseCaseRequest {
  username: string
  email: string
  cpf: string
  password: string
  civilID: number
  birthday: Date
}

type CreateAdminUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreateAdminUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository,
    private hasher: Hasher
  ) {}

  async execute({ username, email, password, cpf, birthday, civilID }: CreateAdminUseCaseRequest): Promise<CreateAdminUseCaseResponse> {
    const passwordHash = await this.hasher.hash(password)

    const nameOrError = Name.create(username)
    const emailOrError = Email.create(email)
    const cpfOrError = CPF.create(cpf)
    const passwordOrError = Password.create(passwordHash)
    const birthdayOrError = Birthday.create(birthday)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    const administratorOrError = Administrator.create({
      username: nameOrError.value, 
      email: emailOrError.value,
      passwordHash: passwordOrError.value,
      role: 'admin',
      cpf: cpfOrError.value,
      birthday: birthdayOrError.value,
      civilID
    })
    if (administratorOrError.isLeft()) return left(administratorOrError.value)
    const administrator = administratorOrError.value

    const administratorAlreadyExistWithCPF = await this.administratorsRepository.findByCPF(administrator.cpf.value)
    if (administratorAlreadyExistWithCPF) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    const userAlreadyExistWithEmail = await this.administratorsRepository.findByEmail(administrator.email.value)
    if (userAlreadyExistWithEmail) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    await this.administratorsRepository.create(administrator)

    return right(null)
  }
}