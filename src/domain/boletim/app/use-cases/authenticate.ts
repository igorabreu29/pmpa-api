import { Either, left, right } from "@/core/either.ts"
import { Encrypter } from "../cryptography/encrypter.ts"
import { AuthenticatesRepository } from "../repositories/authenticates-repository.ts"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts"

interface AuthenticateUseCaseRequest {
  cpf: string
  password: string
}

type AuthenticateUseCaseResponse = Either<InvalidCredentialsError, {
  token: string
  redirect?: boolean
}>

export class AuthenticateUseCase {
  constructor (
    private authenticatesRepository: AuthenticatesRepository,
    private encrypter: Encrypter
  ) {}

  async execute({ cpf, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const authenticate = await this.authenticatesRepository.findByCPF({ cpf })
    if (!authenticate) return left(new InvalidCredentialsError())

    const isPasswordValid = await authenticate.passwordHash.compare(password)
    if (!isPasswordValid) return left(new InvalidCredentialsError())

    const token = this.encrypter.encrypt({
      sub: authenticate.id.toValue(),
      role: authenticate.role
    })

    if (authenticate.role === 'student' && !authenticate.isLoginConfirmed) {
      return right({ redirect: true, token })
    }

    return right({
      token
    })
  }
}