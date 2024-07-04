import { Either, left, right } from "@/core/either.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { UsersRepository } from "../repositories/users-repository.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { User } from "@/domain/boletim/enterprise/entities/user.ts"
import { UserPolesRepository } from "../repositories/user-poles-repository.ts"
import { UsersCourseRepository } from "../repositories/users-course-repository.ts"
import { UserCourse } from "@/domain/boletim/enterprise/entities/user-course.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { UserPole } from "@/domain/boletim/enterprise/entities/user-pole.ts"
import { PolesRepository } from "../repositories/poles-repository.ts"

interface Error {
  name: string
  message: string
}

interface Student {
  username: string
  cpf: string
  email: string
  civilID: number
  courseId: string
  poleId: string
}

interface CreateStudentsBatchUseCaseRequest {
  students: Student[],
  courseId: string,
  poleId: string
}

type CreateStudentsBatchUseCaseResponse = Either<ResourceNotFoundError | [ResourceAlreadyExistError], null>

export class CreateStudentsBatchUseCase {
  constructor (
    private usersRepository: UsersRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private userCoursesRepository: UsersCourseRepository,
    private userPolesRepository: UserPolesRepository,
    private hasher: Hasher
  ) {}

  async execute({ students, courseId, poleId }: CreateStudentsBatchUseCaseRequest): Promise<CreateStudentsBatchUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const users: User[] = []
    const usersOnCourses: UserCourse[] = []
    const usersOnPoles: UserPole[] = []
    const errors: Error[] = []

    await Promise.all(students.map(async (student) => {
      const userExistWithCPF = await this.usersRepository.findByCPF(student.cpf)
      if (userExistWithCPF) {
        const userAlreadyExistOnThisCourse = await this.userCoursesRepository.findByCourseIdAndUserId({ courseId: student.courseId, userId: userExistWithCPF.id.toValue() })
        if (userAlreadyExistOnThisCourse) {
          const error = new ResourceAlreadyExistError('User already exist on this course.')
          return errors.push({
            name: error.name,
            message: error.message
          })
        }

        const userAlreadyExistOnThisPole = await this.userPolesRepository.findByPoleIdAndUserId({ poleId: student.poleId, userId: userExistWithCPF.id.toValue() })
        if (userAlreadyExistOnThisPole) {
          const userPole = UserPole.create({
            poleId: new UniqueEntityId(student.poleId),
            userId: userExistWithCPF.id
          })
          return await this.userPolesRepository.create(userPole)
        }

        const userCourse = UserCourse.create({
          courseId: new UniqueEntityId(student.courseId),
          userId: userExistWithCPF.id
        })
        await this.userCoursesRepository.create(userCourse)
        
        return
      }

      const defaultPassword = `Pmp@${student.cpf}`
      const passwordHash = await this.hasher.hash(defaultPassword)
      
      const user = User.create({
        username: student.username,
        active: true, 
        cpf: student.cpf,
        email: student.email,
        password: passwordHash,
        role: 'student',
        documents: {
          civilID: student.civilID
        },
      })

      const userOnCourse = UserCourse.create({
        courseId: new UniqueEntityId(student.courseId),
        userId: user.id
      })
      usersOnCourses.push(userOnCourse)

      const userOnPole = UserPole.create({
        poleId: new UniqueEntityId(student.poleId),
        userId: user.id
      })
      usersOnPoles.push(userOnPole)

      users.push(user)
    }))

    if (errors.length) return left([new ResourceAlreadyExistError('User already be present on this course or pole')])
    await this.usersRepository.createMany(users)
    await this.userCoursesRepository.createMany(usersOnCourses)
    await this.userPolesRepository.createMany(usersOnPoles)

    return right(null)
  }
}