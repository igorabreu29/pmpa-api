import { Either, left, right } from "@/core/either.ts";
import { Hasher } from "../cryptography/hasher.ts";
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

interface CreateManagerUseCaseRequest {
  username: string
  email: string
  cpf: string
  birthday: Date
  civilID: number
  courseId: string
  poleId: string
}

type CreateManagerUseCaseResponse = Either<ResourceNotFoundError | ResourceAlreadyExistError, null>

export class CreateManagerUseCase {
  constructor (
    private managersRepository: ManagersRepository,
    private managersCoursesRepository: ManagersCoursesRepository, 
    private managersPolesRepository: ManagersPolesRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private hasher: Hasher
  ) {}

  async execute({
    courseId,
    poleId,
    cpf, 
    email, 
    username,
    birthday,
    civilID
  }: CreateManagerUseCaseRequest): Promise<CreateManagerUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const defaultPassword = `Pmp@${cpf}`
    const passwordHash = await this.hasher.hash(defaultPassword)

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

    const managerOrError = Manager.create({
      username: nameOrError.value, 
      cpf: cpfOrError.value,
      email: emailOrError.value,
      passwordHash: passwordOrError.value,
      civilID,
      birthday: birthdayOrError.value,
      role: 'manager'
    }) 
    if (managerOrError.isLeft()) return left(managerOrError.value)

    const manager = managerOrError.value

    const managerWithCPF = await this.managersRepository.findByCPF(manager.cpf.value)
    if (managerWithCPF) {
      const managerAlreadyPresentInTheCourse = await this.managersCoursesRepository.findByManagerIdAndCourseId({ managerId: managerWithCPF.id.toValue(), courseId })
      if (managerAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Manager already present in the course'))

      const managerCourse = ManagerCourse.create({
        managerId: managerWithCPF.id,
        courseId: course.id
      })
      await this.managersCoursesRepository.create(managerCourse)
      
      const managerAlreadyPresentAtPole = await this.managersPolesRepository.findByManagerId({ managerId: managerWithCPF.id.toValue() })
      if (managerAlreadyPresentAtPole) return left(new ResourceAlreadyExistError('Manager already present at a pole'))

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
      if (managerAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Manager already present in the course'))

      const managerCourse = ManagerCourse.create({
        managerId: managerWithEmail.id,
        courseId: course.id
      })
      await this.managersCoursesRepository.create(managerCourse)
      
      const managerAlreadyPresentAtPole = await this.managersPolesRepository.findByManagerId({ managerId: managerWithEmail.id.toValue() })
      if (managerAlreadyPresentAtPole) return left(new ResourceAlreadyExistError('Manager already present at a pole'))

      const managerPole = ManagerPole.create({
        managerId: managerWithEmail.id,
        poleId: pole.id
      })
      await this.managersPolesRepository.create(managerPole)

      return right(null)
    }

    await this.managersRepository.create(manager)
    
    const managerCourse = ManagerCourse.create({
      managerId: manager.id,
      courseId: course.id
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