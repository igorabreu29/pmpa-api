import { Either, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";

interface GetStudentAssessmentsUseCaseRequest {
  courseId: string
  studentId: string
}

type GetStudentAssessmentsUseCaseResponse = Either<null, {
  assessments: Assessment[]
}>

export class GetStudentAssessmentsUseCase {
  constructor(
    private assessmentsRepository: AssessmentsRepository,
  ) {}

  async execute({ courseId, studentId }: GetStudentAssessmentsUseCaseRequest): Promise<GetStudentAssessmentsUseCaseResponse> {
    const assessments = await this.assessmentsRepository.findManyByStudentIdAndCourseId({ studentId, courseId })
    return right({ assessments })
  }
}