import { Either, left, right } from "@/core/either.ts";
import { UsersRepository } from "../repositories/users-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface UpdateProfileUserUseCaseRequest {
  userId: string
  name?: string
  email?: string
  motherName?: string
  fatherName?: string
  birthday?: string
}

type UpdateProfileUserUseCaseResponse = Either<ResourceNotFoundError, null>

export class UpdateProfileUserUseCase {
  constructor (
    private usersRepository: UsersRepository,
  ) {}

  async execute({ 
    userId,
    name, 
    email, 
    motherName, 
    fatherName, 
    birthday,
  }: UpdateProfileUserUseCaseRequest): Promise<UpdateProfileUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError('It is not possible update a user not existing.'))
    
    user.username = name || user.username
    user.email = email || user.email
    user.parent = {
      fatherName: fatherName || user.parent?.fatherName,
      motherName: motherName || user.parent?.motherName
    }
    user.birthday = birthday ? new Date(birthday) : user.birthday

    await this.usersRepository.update(user)

    return right(null)
  }
}