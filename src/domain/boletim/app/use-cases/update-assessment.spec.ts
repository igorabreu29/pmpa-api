import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { UpdateAssessmentUseCaseUseCase } from "./update-assessment.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";


let assessmentsRepository: InMemoryAssessmentsRepository
let sut: UpdateAssessmentUseCaseUseCase

describe(('Update Assessment Use Case'), () => {
  beforeEach(() => {
    vi.useFakeTimers(),
    
    assessmentsRepository = new InMemoryAssessmentsRepository()
    sut = new UpdateAssessmentUseCaseUseCase(assessmentsRepository)
  })

  it ('should not be able to update assessment if user access is student', async () => {
    const result = await sut.execute({
      id: '',
      userId: '',
      userIp: '',
      role: 'student'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  
  it ('should not be able to update assessment if it does not exist', async () => {
    const result = await sut.execute({
      id: '',
      userId: '',
      userIp: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update asssessment if avi is less than 0', async () => {
    const assessment = makeAssessment({ vf: 5 })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      id: assessment.id.toValue(),
      vf: 5,
      avi: -1,
      userId: '',
      userIp: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to update asssessment if avii is less than 0 or greater than 10', async () => {
    const assessment = makeAssessment({ vf: 5, avi: 5 })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      id: assessment.id.toValue(),
      vf: 5,
      avii: -1,
      userId: '',
      userIp: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to update asssessment if vfe is less than 0 or greater than 10', async () => {
    const assessment = makeAssessment({ vf: 5 })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      id: assessment.id.toValue(),
      vf: 5,
      vfe: -1,
      userId: '',
      userIp: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to update asssessment if avii has been passed and avi has not passed', async () => {
    const assessment = makeAssessment({ vf: 5 })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      id: assessment.id.toValue(),
      vf: 5,
      avii: 10,
      userId: '',
      userIp: '',
      role: 'admin'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should be able to update assessment', async () => {
    const assessment = makeAssessment({ vf: 5, avi: 6, avii: 5 })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      id: assessment.id.toValue(),
      vf: 7,
      avi: 7,
      vfe: 7,
      userId: '',
      userIp: '',
      role: 'dev'
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items[0]).toMatchObject({
      vf: 7,
      vfe: 7,
      avi: 7
    })
  })
})