import { Either, left, right } from "@/core/either.ts";
import { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { formatCPF } from "@/core/utils/formatCPF.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { AdministratorEvent } from "../../enterprise/events/administrator-event.ts";

interface UpdateAdministratorUseCaseRequest {
  userId: string
  userIp: string

  id: string
  username?: string
  email?: string
  password?: string
  cpf?: string
  civilId?: string
  militaryId?: string
  motherName?: string
  fatherName?: string
  state?: string
  county?: string
  birthday?: Date

  role: string
}

type UpdateAdministratorUseCaseResponse = Either<
    | ResourceNotFoundError
    | InvalidNameError
    | InvalidEmailError
    | InvalidPasswordError
    | InvalidBirthdayError
    | InvalidCPFError, 
    null
  >

export class UpdateAdministratorUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository
  ) {}

  async execute({ id, username, email, password, cpf, civilId, militaryId, motherName, fatherName, state, county, birthday, role, userId, userIp }: UpdateAdministratorUseCaseRequest): Promise<UpdateAdministratorUseCaseResponse> {
    if (role !== 'dev') return left(new NotAllowedError())
      
    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError('Administrador não encontrado.'))

    const cpfFormatted = formatCPF(administrator.cpf.value)

    const nameOrError = Name.create(username ?? administrator.username.value)
    const emailOrError = Email.create(email ?? administrator.email.value)
    const passwordOrError = Password.create(password ?? administrator.passwordHash.value)
    const birthdayOrError = Birthday.create(birthday ?? administrator.birthday.value)
    const cpfOrError = CPF.create(cpf ?? cpfFormatted)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)

    if (password) {
      const isEqualsPassword = await administrator.passwordHash.compare(password)
      if (!isEqualsPassword) await passwordOrError.value.hash()
    }

    administrator.username = nameOrError.value
    administrator.email = emailOrError.value
    administrator.passwordHash = passwordOrError.value
    administrator.birthday = birthdayOrError.value
    administrator.cpf = cpfOrError.value
    administrator.civilId = civilId ?? administrator.civilId
    administrator.militaryId = militaryId ?? administrator.militaryId
    administrator.parent = {
      motherName: motherName ?? administrator.parent?.motherName,
      fatherName: fatherName ?? administrator.parent?.fatherName
    }
    administrator.state = state ?? administrator.state
    administrator.county = county ?? administrator.county
    
    administrator.addDomainAdministratorEvent(
      new AdministratorEvent({
        administrator,
        reporterId: userId, 
        reporterIp: userIp
      })
    )

    await this.administratorsRepository.save(administrator)

    return right(null)
  }
}