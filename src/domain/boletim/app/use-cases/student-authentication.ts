import { Either, left, right } from "@/core/either.ts"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts"
import { StudentsRepository } from "../repositories/students-repository.ts"
import { Hasher } from "../cryptography/hasher.ts"
import { Encrypter } from "../cryptography/encrypter.ts"

interface StudentAuthenticationUseCaseRequest {
  cpf: string
  password: string
}

type StudentAuthenticationUseCaseResponse = Either<InvalidCredentialsError, {
  token: string
} | { redirect: true }>

export class StudentAuthenticationUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute({ cpf, password }: StudentAuthenticationUseCaseRequest): Promise<StudentAuthenticationUseCaseResponse> {
    const student = await this.studentsRepository.findByCPF(cpf)
    if (!student) return left(new InvalidCredentialsError())
    
    const isPasswordValid = await this.hasher.compare(password, student.passwordHash)
    if (!isPasswordValid) return left(new InvalidCredentialsError())

    if (!student.loginConfirmation) {
      return right({ redirect: true })
    }

    const token = this.encrypter.encrypt({
      sub: student.id.toValue(),
      role: student.role
    })

    return right({ token })
  }
}