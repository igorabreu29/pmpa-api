import { Either, left, right } from "@/core/either.ts"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { Encrypter } from "../cryptography/encrypter.ts"
import { DevelopersRepository } from "../repositories/developers-repository.ts"

interface DevelopersAuthenticateUseCaseRequest {
  cpf: string
  password: string
}

type DevelopersAuthenticateUseCaseResponse = Either<InvalidCredentialsError, {
  token: string
}>

export class DevelopersAuthenticateUseCase {
  constructor (
    private developersRepository: DevelopersRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute({ cpf, password }: DevelopersAuthenticateUseCaseRequest): Promise<DevelopersAuthenticateUseCaseResponse> {
    const developer = await this.developersRepository.findByCPF(cpf)
    if (!developer) return left(new InvalidCredentialsError())
    
    const isPasswordValid = await this.hasher.compare(password, developer.passwordHash)
    if (!isPasswordValid) return left(new InvalidCredentialsError())

    const token = this.encrypter.encrypt({
      sub: developer.id.toValue(),
      role: developer.role
    })

    return right({ token })
  }
}