import { Either, left, right } from "@/core/either.ts";
import { UsersRepository } from "../repositories/users-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { PolesRepository } from "../repositories/poles-repository.ts";

interface UpdateUserUseCaseRequest {
  userId: string
  name?: string
  email?: string
  motherName?: string
  fatherName?: string
  birthday?: string
  previousCourseId: string
  currentCourseId: string
  previousPoleId: string
  currentPoleId: string
}

type UpdateUserUseCaseResponse = Either<ResourceNotFoundError, null>

export class UpdateUserUseCase {
  constructor (
    private usersRepository: UsersRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository
  ) {}

  async execute({ 
    userId,
    name, 
    email, 
    motherName, 
    fatherName, 
    birthday, 
    previousCourseId, 
    currentCourseId, 
    currentPoleId, 
    previousPoleId 
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError('It is not possible update a user not existing.'))
    
    const previousCourseIndex = user.courses.findIndex(course => course.id.toValue() === previousCourseId)
    const currentCourse = await this.coursesRepository.findById(currentCourseId)
    if (!currentCourse) return left(new ResourceNotFoundError('Course not found.'))

    const previousPoleIndex = user.poles.findIndex(pole => pole.id.toValue() === previousPoleId)
    const currentPole = await this.polesRepository.findById(currentPoleId)
    if (!currentPole) return left(new ResourceNotFoundError('Pole not found.'))
    
    user.username = name || user.username
    user.email = email || user.email
    user.parent = {
      fatherName: fatherName || user.parent?.fatherName,
      motherName: motherName || user.parent?.motherName
    }
    user.birthday = birthday ? new Date(birthday) : user.birthday
    user.courses[previousCourseIndex] = currentCourse
    user.poles[previousPoleIndex] = currentPole

    await this.usersRepository.update(user)

    return right(null)
  }
}