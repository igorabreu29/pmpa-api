import { Either, left, right } from "@/core/either.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { Encrypter } from "../cryptography/encrypter.ts"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts"
import { UsersRepository } from "../repositories/users-repository.ts"

interface AuthenticateUseCaseRequest {
  cpf: string
  password: string
}

type AuthenticateUseCaseResponse = Either<InvalidCredentialsError, {
  token: string
} | { redirect: true }>

export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute({ cpf, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const customer = await this.usersRepository.findByCPF(cpf)
    if (!customer) return left(new InvalidCredentialsError())
    
    const isPasswordValid = await this.hasher.compare(password, customer.password)
    if (!isPasswordValid) return left(new InvalidCredentialsError())

    if (customer.role === 'student' && !customer.loginConfirmation) {
      return right({ redirect: true })
    }

    const token = this.encrypter.encrypt({
      sub: customer.id.toValue(),
      role: customer.role
    })

    return right({ token })
  }
}