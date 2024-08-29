import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { AdministratorsRepository } from "../repositories/administrators-repository.ts"
import { Administrator } from "../../enterprise/entities/administrator.ts"
import { Name } from "../../enterprise/entities/value-objects/name.ts"
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts"
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts"
import { Email } from "../../enterprise/entities/value-objects/email.ts"
import { Password } from "../../enterprise/entities/value-objects/password.ts"
import { AdministratorEvent } from "../../enterprise/events/administrator-event.ts"
import type { Role } from "../../enterprise/entities/authenticate.ts"
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"
import type { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts"
import type { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts"
import type { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts"
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"
import type { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts"

interface CreateAdminUseCaseRequest {
  userId: string
  userIp: string

  username: string
  email: string
  cpf: string
  password: string
  civilId: string
  birthday: Date

  role: Role
}

type CreateAdminUseCaseResponse = Either<
    | ResourceAlreadyExistError
    | InvalidEmailError
    | InvalidCPFError
    | InvalidPasswordError
    | InvalidNameError
    | InvalidBirthdayError
    | NotAllowedError, 
    null
  >

export class CreateAdminUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository,
  ) {}

  async execute({ username, email, password, cpf, birthday, civilId, userId, userIp, role }: CreateAdminUseCaseRequest): Promise<CreateAdminUseCaseResponse> {
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
    const administratorOrError = Administrator.create({
      username: nameOrError.value, 
      email: emailOrError.value,
      passwordHash: passwordOrError.value,
      role: 'admin',
      cpf: cpfOrError.value,
      birthday: birthdayOrError.value,
      civilId
    })
    if (administratorOrError.isLeft()) return left(administratorOrError.value)
    const administrator = administratorOrError.value

    const administratorAlreadyExistWithCPF = await this.administratorsRepository.findByCPF(administrator.cpf.value)
    if (administratorAlreadyExistWithCPF) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    const userAlreadyExistWithEmail = await this.administratorsRepository.findByEmail(administrator.email.value)
    if (userAlreadyExistWithEmail) return left(new ResourceAlreadyExistError('Administrator already exist.'))

    administrator.addDomainAdministratorEvent(
      new AdministratorEvent({
        administrator,
        reporterId: userId, 
        reporterIp: userIp
      })
    )

    await this.administratorsRepository.create(administrator)
    return right(null)
  }
}