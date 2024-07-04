import { Either, left, right } from "@/core/either.ts";
import { UsersRepository } from "../repositories/users-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface LoginConfirmationByStudentUseCaseRequest {
  userId: string
  birthday: Date
  email: string
  fatherName?: string
  motherName?: string
  civilID: number
  militaryID: number
  state: string
  county: string
}

type LoginConfirmationByStudentUseCaseResponse = Either<ResourceNotFoundError, null>

export class LoginConfirmationByStudentUseCase {
  constructor(
    private usersRepository: UsersRepository
  ) {}

  async execute({
    userId,
    birthday,
    email,
    fatherName,
    motherName,
    civilID,
    militaryID,
    state,
    county
  }: LoginConfirmationByStudentUseCaseRequest): Promise<LoginConfirmationByStudentUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError('User not found.'))

      user.email = email || user.email
      user.parent = {
        fatherName: fatherName || user.parent?.fatherName,
        motherName: motherName || user.parent?.motherName
      }
      user.documents = {
        civilID: civilID || user.documents?.civilID,
        militaryID: militaryID || user.documents?.militaryID
      }
      user.birthday = birthday ? new Date(birthday) : user.birthday
      user.state = state ?? user.state
      user.county = county ?? user.county
      
      user.loginConfirmation = true
      
      await this.usersRepository.update(user)

      return right(null)
  }
}