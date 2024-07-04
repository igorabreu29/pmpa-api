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

interface CreateManagerInCourseAndPoleRequest {
  username: string
  email: string
  cpf: string
  birthday: Date
  civilID: number
  courseId: string
  poleId: string
}

type CreateManagerInCourseAndPoleResponse = Either<ResourceNotFoundError | ResourceAlreadyExistError, null>

export class CreateManagerInCourseAndPole {
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
  }: CreateManagerInCourseAndPoleRequest): Promise<CreateManagerInCourseAndPoleResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const managerWithCPF = await this.managersRepository.findByCPF(cpf)
    if (managerWithCPF) {
      const studentAlreadyPresentInTheCourse = await this.managersCoursesRepository.findByManagerIdAndCourseId({ managerId: managerWithCPF.id.toValue(), courseId })
      if (studentAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Student already present in the course'))
      
      const studentAlreadyPresentInThePole = await this.managersPolesRepository.findByStudentIdAndPoleId({ managerId: managerWithCPF.id.toValue(), poleId })
      if (!studentAlreadyPresentInThePole) {
        const managerPole = ManagerPole.create({
          managerId: managerWithCPF.id,
          poleId: pole.id
        })
        await this.managersPolesRepository.create(managerPole)
      }

      const managerCourse = ManagerCourse.create({
        managerId: managerWithCPF.id,
        courseId: course.id
      })
      await this.managersCoursesRepository.create(managerCourse)

      return right(null)
    }

    const managerWithEmail = await this.managersRepository.findByEmail(email)
    if (managerWithEmail) {
      const studentAlreadyPresentInTheCourse = await this.managersCoursesRepository.findByManagerIdAndCourseId({ managerId: managerWithEmail.id.toValue(), courseId })
      if (studentAlreadyPresentInTheCourse) return left(new ResourceAlreadyExistError('Student already present in the course'))
      
      const studentAlreadyPresentInThePole = await this.managersPolesRepository.findByStudentIdAndPoleId({ managerId: managerWithEmail.id.toValue(), poleId })
      if (!studentAlreadyPresentInThePole) {
        const managerPole = ManagerPole.create({
          managerId: managerWithEmail.id,
          poleId: pole.id
        })
        await this.managersPolesRepository.create(managerPole)
      }

      const managerCourse = ManagerCourse.create({
        managerId: managerWithEmail.id,
        courseId: course.id
      })
      await this.managersCoursesRepository.create(managerCourse)

      return right(null)
    }

    const defaultPassword = `Pmp@${cpf}`
    const passwordHash = await this.hasher.hash(defaultPassword)
    const manager = Manager.create({
      username, 
      cpf,
      email,
      passwordHash,
      civilID,
      birthday,
      role: 'manager'
    })
    await this.managersRepository.create(manager)

    const managerCourse = ManagerCourse.create({
      managerId: manager.id,
      courseId: course.id
    })
    await this.managersCoursesRepository.create(managerCourse)

    const managerPole = ManagerPole.create({
      managerId: manager.id,
      poleId: pole.id
    })
    await this.managersPolesRepository.create(managerPole)

    return right(null)
  }
}