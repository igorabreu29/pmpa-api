import { left, right, type Either } from "@/core/either.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import type { ManagersRepository } from "../repositories/managers-repository.ts";
import type { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import type { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import type { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import type { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { formatCPF } from "@/core/utils/formatCPF.ts";
import { ManagerEvent } from "../../enterprise/events/manager-event.ts";

interface UpdateManagerUseCaseRequest {
  userId: string
  userIp: string

  id: string
  role: string
  username?: string
  email?: string
  cpf?: string
  password?: string
  civilId?: number
  militaryId?: number
  motherName?: string
  fatherName?: string
  birthday?: Date
  state?: string
  county?: string
  courseId?: string
  poleId?: string
}

type UpdateManagerUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError
  | InvalidNameError
  | InvalidEmailError
  | InvalidPasswordError
  | InvalidBirthdayError
  | InvalidBirthdayError
  | InvalidCPFError, null>

export class UpdateManagerUseCase {
  constructor (
    private managersRepository: ManagersRepository
  ) {}

  async execute({
    id,
    role,
    username,
    email,
    cpf,
    password,
    civilId,
    militaryId,
    motherName,
    fatherName,
    birthday,
    state,
    county,
    userId,
    userIp
  }: UpdateManagerUseCaseRequest): Promise<UpdateManagerUseCaseResponse> {
    if (role === 'student' || role === 'manager') return left(new NotAllowedError())
      
    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('manager not found.'))

    const cpfFormatted = formatCPF(manager.cpf.value)
    
    const nameOrError = Name.create(username ?? manager.username.value)
    const emailOrError = Email.create(email ?? manager.email.value)
    const passwordOrError = Password.create(password ?? manager.passwordHash.value)
    const birthdayOrError = Birthday.create(birthday ?? manager.birthday.value)
    const cpfOrError = CPF.create(cpf ?? cpfFormatted)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)
  
    manager.username = nameOrError.value
    manager.email = emailOrError.value
    manager.passwordHash = passwordOrError.value
    manager.birthday = birthdayOrError.value
    manager.cpf = cpfOrError.value
    manager.civilId = civilId ?? manager.civilId
    manager.militaryId = militaryId ?? manager.militaryId
    manager.parent = {
      motherName: motherName ?? manager.parent?.motherName,
      fatherName: fatherName ?? manager.parent?.fatherName
    }
    manager.state = state ?? manager.state
    manager.county = county ?? manager.county

    await this.managersRepository.save(manager)
    
    manager.addDomainManagerEvent(
      new ManagerEvent({
        manager,
        reporterId: userId,
        reporterIp: userIp
      })
    )
    return right(null)
  }
}