import { Either, left, right } from "@/core/either.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { PolesRepository } from "../repositories/poles-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import { ManagersPolesRepository } from "../repositories/managers-poles-repository.ts";
import { ManagerPole } from "../../enterprise/entities/manager-pole.ts";
import { ManagerCourse } from "../../enterprise/entities/manager-course.ts";
import { Manager } from "../../enterprise/entities/manager.ts";
import { Birthday } from "../../enterprise/entities/value-objects/birthday.ts";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";
import { Email } from "../../enterprise/entities/value-objects/email.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { Password } from "../../enterprise/entities/value-objects/password.ts";
import { ManagerEvent } from "../../enterprise/events/manager-event.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import type { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import type { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import type { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import type { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";

interface CreateManagerUseCaseRequest {
  userId: string
  userIp: string

  username: string
  email: string
  cpf: string
  birthday: Date
  civilId: string
  courseId: string
  poleId: string

  role: Role
}

type CreateManagerUseCaseResponse = Either<
    | ResourceNotFoundError 
    | ResourceAlreadyExistError
    | InvalidEmailError
    | InvalidCPFError
    | InvalidPasswordError
    | InvalidNameError
    | InvalidBirthdayError
    | NotAllowedError, 
    null
  >

export class CreateManagerUseCase {
  constructor (
    private managersRepository: ManagersRepository,
    private managersCoursesRepository: ManagersCoursesRepository, 
    private managersPolesRepository: ManagersPolesRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
  ) {}

  async execute({
    userId,
    userIp,
    courseId,
    poleId,
    cpf, 
    email, 
    username,
    birthday,
    civilId,
    role
  }: CreateManagerUseCaseRequest): Promise<CreateManagerUseCaseResponse> {
    if (role === 'student' || role === 'manager') return left(new NotAllowedError())
      
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Polo não encontrado!'))

    const cpfOrError = CPF.create(cpf)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)

    const cpfTransformed = cpfOrError.value.value
    const defaultPassword = `Pmp@${cpfTransformed}`

    const nameOrError = Name.create(username)
    const emailOrError = Email.create(email)
    const passwordOrError = Password.create(defaultPassword)
    const birthdayOrError = Birthday.create(birthday)

    if (nameOrError.isLeft()) return left(nameOrError.value)
    if (emailOrError.isLeft()) return left(emailOrError.value)
    if (cpfOrError.isLeft()) return left(cpfOrError.value)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
    if (birthdayOrError.isLeft()) return left(birthdayOrError.value)

    await passwordOrError.value.hash()
    const managerOrError = Manager.create({
      username: nameOrError.value, 
      cpf: cpfOrError.value,
      email: emailOrError.value,
      passwordHash: passwordOrError.value,
      civilId,
      birthday: birthdayOrError.value,
      role: 'manager'
    }) 
    if (managerOrError.isLeft()) return left(managerOrError.value)

    const manager = managerOrError.value

    const managerWithCPF = await this.managersRepository.findByCPF(manager.cpf.value)
    if (managerWithCPF) {
      const managerAlreadyPresentInTheCourse = await this.managersCoursesRepository.findByManagerIdAndCourseId({ managerId: managerWithCPF.id.toValue(), courseId })
      if (managerAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Gerente já presente no curso!'))

      const managerCourse = ManagerCourse.create({
        managerId: managerWithCPF.id,
        courseId: course.id
      })
      await this.managersCoursesRepository.create(managerCourse)
      
      const managerAlreadyPresentAtPole = await this.managersPolesRepository.findByManagerId({ managerId: managerWithCPF.id.toValue() })
      if (managerAlreadyPresentAtPole) return left(new ResourceAlreadyExistError('Gerente já presente no polo!'))

      const managerPole = ManagerPole.create({
        managerId: managerCourse.id,
        poleId: pole.id
      })
      await this.managersPolesRepository.create(managerPole)
      
      return right(null)
    }

    const managerWithEmail = await this.managersRepository.findByEmail(manager.email.value)
    if (managerWithEmail) {
      const managerAlreadyPresentInTheCourse = await this.managersCoursesRepository.findByManagerIdAndCourseId({ managerId: managerWithEmail.id.toValue(), courseId })
      if (managerAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Gerente já presente no curso!'))

      const managerCourse = ManagerCourse.create({
        managerId: managerWithEmail.id,
        courseId: course.id
      })
      await this.managersCoursesRepository.create(managerCourse)
      
      const managerAlreadyPresentAtPole = await this.managersPolesRepository.findByManagerId({ managerId: managerWithEmail.id.toValue() })
      if (managerAlreadyPresentAtPole) return left(new ResourceAlreadyExistError('Gerente já presente no polo!'))

      const managerPole = ManagerPole.create({
        managerId: managerCourse.id,
        poleId: pole.id
      })
      await this.managersPolesRepository.create(managerPole)

      return right(null)
    }

    manager.addDomainManagerEvent(
      new ManagerEvent({
        manager,
        reporterId: userId,
        courseId,
        reporterIp: userIp
      })
    )
    
    await this.managersRepository.create(manager)
    const managerCourse = ManagerCourse.create({
      managerId: manager.id,
      courseId: course.id,
    })
    await this.managersCoursesRepository.create(managerCourse)

    const managerPole = ManagerPole.create({
      managerId: managerCourse.id,
      poleId: pole.id
    })
    await this.managersPolesRepository.create(managerPole)

    return right(null)
  }
}