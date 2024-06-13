import { Either, left, right } from "@/core/either.ts"
import { UsersRepository } from "../repositories/users-repository.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { Role, User } from "@/domain/enterprise/entities/user.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { PolesRepository } from "../repositories/poles-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"

interface CreateUserUseCaseRequest {
  username: string
  email: string
  cpf: string
  role: Role
  password?: string
  courseId: string
  poleId: string
}

type CreateUserUseCaseResponse = Either<ResourceAlreadyExistError | ResourceNotFoundError, null>

export class CreateUserUseCase {
  constructor (
    private usersRepository: UsersRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private hasher: Hasher
  ) {}

  async execute({ username, email, password, cpf, role, courseId, poleId }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userAlreadyExistWithCPF = await this.usersRepository.findByCPF(cpf)
    if (userAlreadyExistWithCPF) return left(new ResourceAlreadyExistError('User already exist.'))

    const userAlreadyExistWithEmail = await this.usersRepository.findByEmail(email)
    if (userAlreadyExistWithEmail) return left(new ResourceAlreadyExistError('User already exist.'))

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const defaultPassword = `Pmp@${cpf}`
    const passwordHash = await this.hasher.hash(password ?? defaultPassword)

    const user = User.create({
      username, 
      email,
      password: passwordHash,
      role,
      cpf,
      active: true,
      courses: [course],
      poles: [pole]
    })
    await this.usersRepository.create(user)

    return right(null)
  }
}