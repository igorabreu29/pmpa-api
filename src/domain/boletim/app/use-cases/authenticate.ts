import { Either, left, right } from "@/core/either.ts"
import { Encrypter } from "../cryptography/encrypter.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { AuthenticatesRepository } from "../repositories/authenticates-repository.ts"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts"

interface AuthenticateUseCaseRequest {
  cpf: string
  password: string
}

type AuthenticateUseCaseResponse = Either<InvalidCredentialsError, {
  token: string 
} | { redirect: boolean }>

export class AuthenticateUseCase {
  constructor (
    private authenticatesRepository: AuthenticatesRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute({ cpf, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const authenticate = await this.authenticatesRepository.findByCPF({ cpf })
    if (!authenticate) return left(new InvalidCredentialsError())

    const isPasswordValid = await this.hasher.compare(password, authenticate.passwordHash.value)
    if (!isPasswordValid) return left(new InvalidCredentialsError())

    if (authenticate.role === 'student' && !authenticate.isLoginConfirmed) {
      return right({ redirect: true })
    }

    const token = this.encrypter.encrypt({
      sub: authenticate.id.toValue(),
      role: authenticate.role
    })

    return right({
      token
    })
  }
}