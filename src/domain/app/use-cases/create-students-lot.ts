import { Either, left, right } from "@/core/either.ts"
import { UsersRepository } from "../repositories/users-repository.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { PolesRepository } from "../repositories/poles-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { User } from "@/domain/enterprise/entities/user.ts"

interface Error {
  name: string
  message: string
}

interface Student {
  username: string
  cpf: string
  email: string
  civilID: number
  poleName: string
}

interface CreateStudentsLotUseCaseRequest {
  students: Student[],
  courseName: string
}

type CreateStudentsLotUseCaseResponse = Either<ResourceNotFoundError | [ResourceNotFoundError, ResourceAlreadyExistError], null>

export class CreateStudentsLotUseCase {
  constructor (
    private usersRepository: UsersRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private hasher: Hasher
  ) {}

  async execute({ students, courseName }: CreateStudentsLotUseCaseRequest): Promise<CreateStudentsLotUseCaseResponse> {
    const course = await this.coursesRepository.findByName(courseName)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const users: User[] = []
    const errors: Error[] = []

    await Promise.all(students.map(async (student) => {
      const pole = await this.polesRepository.findByName(student.poleName)

      if (!pole) {
        const error = new ResourceNotFoundError('Pole not found.')
        return errors.push({ name: error.name, message: error.message })
      }

      const userAlreadyExistOnThisCourse = await this.usersRepository.findByCPFAndCourseId({ cpf: student.cpf, courseId: course.id.toValue() }) 
      if (userAlreadyExistOnThisCourse) {
        const error = new ResourceAlreadyExistError('User already present on this course.')
        return errors.push({ name: error.name, message: error.message })
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
        poles: [pole],
        courses: [course]
      })

      users.push(user)
    }))

    if (errors.length) return left([new ResourceNotFoundError('Pole not found.'), new ResourceAlreadyExistError('User already present on this course.')])

    await this.usersRepository.createMany(users)

    return right(null)
  }
}