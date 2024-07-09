import { Either, left, right } from "@/core/either.ts"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { Encrypter } from "../cryptography/encrypter.ts"
import { AdministratorsRepository } from "../repositories/administrators-repository.ts"

interface AdministratorsAuthenticateUseCaseRequest {
  cpf: string
  password: string
}

type AdministratorsAuthenticateUseCaseResponse = Either<InvalidCredentialsError, {
  token: string
}>

export class AdministratorsAuthenticateUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute({ cpf, password }: AdministratorsAuthenticateUseCaseRequest): Promise<AdministratorsAuthenticateUseCaseResponse> {
    const administrator = await this.administratorsRepository.findByCPF(cpf)
    if (!administrator) return left(new InvalidCredentialsError())
    
    const isPasswordValid = await this.hasher.compare(password, administrator.passwordHash)
    if (!isPasswordValid) return left(new InvalidCredentialsError())

    const token = this.encrypter.encrypt({
      sub: administrator.id.toValue(),
      role: administrator.role
    })

    return right({ token })
  }
}