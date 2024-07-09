import { Either, left, right } from "@/core/either.ts"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { Encrypter } from "../cryptography/encrypter.ts"
import { ManagersRepository } from "../repositories/managers-repository.ts"

interface ManagersAuthenticateUseCaseRequest {
  cpf: string
  password: string
}

type ManagersAuthenticateUseCaseResponse = Either<InvalidCredentialsError, {
  token: string
}>

export class ManagersAuthenticateUseCase {
  constructor (
    private managersRepository: ManagersRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute({ cpf, password }: ManagersAuthenticateUseCaseRequest): Promise<ManagersAuthenticateUseCaseResponse> {
    const manager = await this.managersRepository.findByCPF(cpf)
    if (!manager) return left(new InvalidCredentialsError())
    
    const isPasswordValid = await this.hasher.compare(password, manager.passwordHash)
    if (!isPasswordValid) return left(new InvalidCredentialsError())

    const token = this.encrypter.encrypt({
      sub: manager.id.toValue(),
      role: manager.role
    })

    return right({ token })
  }
}