import { Either, left, right } from "@/core/either.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { AuthenticatesRepository } from "../repositories/authenticates-repository.ts"
import { ConflictError } from "./errors/conflict-error.ts"
import { Password } from "../../enterprise/entities/value-objects/password.ts"
import type { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts"

interface RestorePasswordUseCaseRequest {
  email: string
  newPassword: string
  confirmPassword: string
}

type RestorePasswordUseCaseResponse = Either<ResourceNotFoundError | ConflictError | InvalidPasswordError, null>

export class RestorePasswordUseCase {
  constructor(
    private authenticatesRepository: AuthenticatesRepository,
  ) {}

  async execute({ email, newPassword, confirmPassword }: RestorePasswordUseCaseRequest): Promise<RestorePasswordUseCaseResponse> {
    const user = await this.authenticatesRepository.findByEmail({ email })
    if (!user) return left(new ResourceNotFoundError('User not found.'))

    if (newPassword !== confirmPassword) return left(new ConflictError('Passwords not equals.'))

    const passwordOrError = Password.create(newPassword)
    if (passwordOrError.isLeft()) return left(passwordOrError.value)
      
    await passwordOrError.value.hash()
    user.passwordHash = passwordOrError.value

    await this.authenticatesRepository.save(user)

    return right(null)
  }
}