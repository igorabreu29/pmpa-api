import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { UpdateAssessmentUseCaseUseCase } from "./update-assessment.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { RemoveAssessmentGradeUseCase } from "./remove-assessment-grade.ts";

let assessmentsRepository: InMemoryAssessmentsRepository
let sut: RemoveAssessmentGradeUseCase

describe(('Remove Assessment Grade Use Case'), () => {
  beforeEach(() => {
    assessmentsRepository = new InMemoryAssessmentsRepository()
    sut = new RemoveAssessmentGradeUseCase(assessmentsRepository)
  })

  it ('should not be able to update assessment if access level is student', async () => {
    const result = await sut.execute({
      id: 'not-found',
      userId: '',
      userIp: '',
      role: 'student'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  
  it ('should not be able to remove grade if assessment does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found',
      userId: '',
      userIp: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to remove grade', async () => {
    const assessment = makeAssessment({ vf: 5, avi: 6, avii: 5 })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      id: assessment.id.toValue(),
      avi: -1,
      avii: -1,
      userId: '',
      userIp: '',
      role: 'dev'
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items[0]).toMatchObject({
      vf: assessment.vf,
      avi: null,
      avii: null
    })
  })
})