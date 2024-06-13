import { Either, left, right } from "@/core/either.ts"
import { UsersRepository } from "../repositories/users-repository.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { Role, User } from "@/domain/enterprise/entities/user.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"

interface CreateAdminUseCaseRequest {
  username: string
  email: string
  cpf: string
  role: Role
  password: string
}

type CreateAdminUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreateAdminUseCase {
  constructor (
    private usersRepository: UsersRepository,
    private hasher: Hasher
  ) {}

  async execute({ username, email, password, cpf, role }: CreateAdminUseCaseRequest): Promise<CreateAdminUseCaseResponse> {
    const userAlreadyExistWithCPF = await this.usersRepository.findByCPF(cpf)
    if (userAlreadyExistWithCPF) return left(new ResourceAlreadyExistError('User already exist.'))

    const userAlreadyExistWithEmail = await this.usersRepository.findByEmail(email)
    if (userAlreadyExistWithEmail) return left(new ResourceAlreadyExistError('User already exist.'))

    const passwordHash = await this.hasher.hash(password)

    const user = User.create({
      username, 
      email,
      password: passwordHash,
      role,
      cpf,
      active: true,
      courses: [],
      poles: []
    })
    await this.usersRepository.create(user)

    return right(null)
  }
}