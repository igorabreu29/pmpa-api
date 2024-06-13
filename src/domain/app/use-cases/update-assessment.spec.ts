import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { UpdateAssessmentUseCaseUseCase } from "./update-assessment.ts";

let assessmentsRepository: InMemoryAssessmentsRepository
let sut: UpdateAssessmentUseCaseUseCase

describe(('Delete Assessment Use Case'), () => {
  beforeEach(() => {
    assessmentsRepository = new InMemoryAssessmentsRepository()
    sut = new UpdateAssessmentUseCaseUseCase(assessmentsRepository)
  })

  it ('should not be able to update assessment not existing', async () => {
    const result = await sut.execute({
      id: 'not-found',
      vf: null,
      vfe: null,
      avi: null,
      avii: null
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create assessment', async () => {
    const assessment = makeAssessment({ vf: 5, avi: 6, avii: 5 })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      id: assessment.id.toValue(),
      vf: 7,
      vfe: 7,
      avi: 7,
      avii: null
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items[0]).toMatchObject({
      vf: 7,
      vfe: 7,
      avi: 7
    })
  })
})