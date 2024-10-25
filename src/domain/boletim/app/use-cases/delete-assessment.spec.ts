import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { DeleteAssessmentUseCaseUseCase } from "./delete-assessment.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let assessmentsRepository: InMemoryAssessmentsRepository
let sut: DeleteAssessmentUseCaseUseCase

describe(('Delete Assessment Use Case'), () => {
  beforeEach(() => {
    assessmentsRepository = new InMemoryAssessmentsRepository()
    sut = new DeleteAssessmentUseCaseUseCase(assessmentsRepository)
  })

  it ('should not be able to delete assessment if user access is student', async () => {
    const result = await sut.execute({
      id: 'not-found',
      userId: '',
      userIp: '',
      role: 'student'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to delete assessment not existing', async () => {
    const result = await sut.execute({
      id: 'not-found',
      userId: '',
      userIp: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create assessment', async () => {
    const assessment = makeAssessment()
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      id: assessment.id.toValue(),
      userId: '',
      userIp: '',
      role: 'manager'
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items).toHaveLength(0)
  })
})