import { left, right, type Either } from "@/core/either.ts";
import type { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { Assessment } from "../../enterprise/entities/assessment.ts";
import type { DisciplinesRepository } from "../repositories/disciplines-repository.ts";
import type { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";

interface FetchCourseAssessmentsUseCaseRequest {
  courseId: string
  disciplineId: string
}

type FetchCourseAssessmentsUseCaseResponse = Either<ResourceNotFoundError, {
  assessments: Assessment[]
}>

export class FetchCourseAssessmentsUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository,
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({ courseId, disciplineId }: FetchCourseAssessmentsUseCaseRequest): Promise<FetchCourseAssessmentsUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.')) 

    const discipline = await this.disciplinesRepository.findById(disciplineId)
    if (!discipline) return left(new ResourceNotFoundError('Disciplina não existente.')) 

    const courseDiscipline = await this.courseDisciplinesRepository.findByCourseAndDisciplineId({
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue()
    })
    if (!courseDiscipline) return left(new ResourceNotFoundError('Disciplina não existe no curso.'))

    const assessments = await this.assessmentsRepository.findManyByDisciplineAndCourseId({
      courseId: courseDiscipline.courseId.toValue(),
      disciplineId: courseDiscipline.disciplineId.toValue(),
    })

    return right({
      assessments
    })
  }
}