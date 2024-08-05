import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { StudentDetails } from "../../enterprise/entities/value-objects/student-details.ts";

interface GetStudentProfileUseCaseRequest {
  id: string
}

type GetStudentProfileUseCaseResponse = Either<ResourceNotFoundError, {
  student: StudentDetails
}>

export class GetStudentProfileUseCase {
  constructor(
    private studentsRepository: StudentsRepository
  ) {}

  async execute({ id }: GetStudentProfileUseCaseRequest): Promise<GetStudentProfileUseCaseResponse> {
    const student = await this.studentsRepository.findDetailsById(id)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    return right({
      student
    })
  }
}