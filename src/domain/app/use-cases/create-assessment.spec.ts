import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { CreateAssessmentUseCase } from "./create-assessment.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";

let assessmentsRepository: InMemoryAssessmentsRepository
let sut: CreateAssessmentUseCase

describe(('Create Assessment Use Case'), () => {
  beforeEach(() => {
    assessmentsRepository = new InMemoryAssessmentsRepository()
    sut = new CreateAssessmentUseCase(assessmentsRepository)
  })

  it ('should not be able to create assessment if already be added', async () => {
    const assessment = makeAssessment()
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      poleId: '',
      disciplineId: '',
      vf: 2,
      vfe: null,
      avi: null,
      avii: null,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create assessment', async () => {
    const result = await sut.execute({
      studentId: 'user-1',
      courseId: 'course-1',
      poleId: 'pole-1',
      disciplineId: 'discipline-1',
      vf: 5,
      vfe: null,
      avi: null,
      avii: null,
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items).toHaveLength(1)
  })
})