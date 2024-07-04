import { Either, left, right } from "@/core/either.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { Encrypter } from "../cryptography/encrypter.ts"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts"
import { Manager } from "../../enterprise/entities/manager.ts"
import { Administrator } from "../../enterprise/entities/administrator.ts"
import { Developer } from "../../enterprise/entities/developer.ts"
import { ManagersRepository } from "../repositories/managers-repository.ts"
import { AdministratorsRepository } from "../repositories/administrators-repository.ts"
import { DevelopersRepository } from "../repositories/developers-repository.ts"

interface AuthenticateUseCaseRequest {
  cpf: string
  password: string
  role: 'manager' | 'admin' | 'dev'
}

type AuthenticateUseCaseResponse = Either<InvalidCredentialsError, {
  token: string
} | { redirect: true }>

export class AuthenticateUseCase {
  constructor(
    private managersRepository: ManagersRepository,
    private administratorsRepository: AdministratorsRepository,
    private developersRepository: DevelopersRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute({ cpf, password, role }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    let user: Manager | Administrator | Developer | null = null

    if (role === 'manager') {
      const managerWithCPF = await this.managersRepository.findByCPF(cpf)
      user = managerWithCPF
    }

    if (role === 'admin') {
      const administratorWithCPF = await this.administratorsRepository.findByCPF(cpf)
      user = administratorWithCPF
    }

    if (role === 'dev') {
      const developerWithCPF = await this.developersRepository.findByCPF(cpf)
      user = developerWithCPF
    }

    if (!user) return left(new InvalidCredentialsError())

    const isPasswordValid = await this.hasher.compare(password, user.passwordHash)
    if (!isPasswordValid) return left(new InvalidCredentialsError())

    const token = this.encrypter.encrypt({
      sub: user.id.toValue(),
      role: user.role
    })

    return right({ token })
  }
}