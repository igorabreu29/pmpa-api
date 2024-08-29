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
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import { ManagersPolesRepository } from "../repositories/managers-poles-repository.ts";
import { ManagerCourse } from "../../enterprise/entities/manager-course.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ManagerPole } from "../../enterprise/entities/manager-pole.ts";

interface UpdateManagerUseCaseRequest {
  id: string
  courseId: string
  newCourseId: string
  poleId: string

  role: string
  username?: string
  email?: string
  cpf?: string
  password?: string
  civilId?: string
  militaryId?: string
  motherName?: string
  fatherName?: string
  birthday?: Date
  state?: string
  county?: string

  userId: string
  userIp: string
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
    private managersRepository: ManagersRepository,
    private managerCoursesRepository: ManagersCoursesRepository,
    private managerPolesRepository: ManagersPolesRepository
  ) {}

  async execute({
    id,
    courseId, 
    newCourseId,
    poleId,
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
    if (role === 'manager' || role === 'manager') return left(new NotAllowedError())
      
    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('manager not found.'))

    let managerCourse = await this.managerCoursesRepository.findByManagerIdAndCourseId({
      courseId,
      managerId: manager.id.toValue()
    })
    if (!managerCourse) return left(new ResourceNotFoundError('Manager is not present on this course.'))

    if (managerCourse.courseId.toValue() !== newCourseId) {
      const newManagerCourse = ManagerCourse.create({
        courseId: new UniqueEntityId(newCourseId),
        managerId: manager.id,
      })

      const managerPole = ManagerPole.create({
        poleId: new UniqueEntityId(poleId),
        managerId: newManagerCourse.id
      })

      await Promise.all([
        this.managerCoursesRepository.delete(managerCourse),
        this.managerCoursesRepository.create(newManagerCourse),
      ])
      
      await this.managerPolesRepository.create(managerPole)

      managerCourse = newManagerCourse
    }

    const managerPole = await this.managerPolesRepository.findByManagerIdAndPoleId({
      poleId,
      managerId: managerCourse.id.toValue()
    })
    if (!managerPole) {
      const currentManagerPole = await this.managerPolesRepository.findByManagerId({
        managerId: managerCourse.id.toValue()
      })
      if (!currentManagerPole) return left(new ResourceNotFoundError('Manager pole not found.'))

      const newManagerPole = ManagerPole.create({
        poleId: new UniqueEntityId(poleId),
        managerId: managerCourse.id
      })
      
      await Promise.all([
        this.managerPolesRepository.delete(currentManagerPole),
        this.managerPolesRepository.create(newManagerPole)
      ])
    }

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

    if (password) {
      const isEqualsPassword = await manager.passwordHash.compare(password)
      if (!isEqualsPassword) await passwordOrError.value.hash()
    }
  
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

    manager.addDomainManagerEvent(
      new ManagerEvent({
        manager,
        reporterId: userId,
        courseId: managerCourse.courseId.toValue(),
        reporterIp: userIp
      })
    )

    await this.managersRepository.save(manager)

    return right(null)
  }
}