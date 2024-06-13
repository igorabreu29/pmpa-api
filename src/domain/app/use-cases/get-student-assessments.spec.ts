import { beforeEach, describe, expect, it } from "vitest";
import { GetStudentAssessmentsUseCase } from "./get-student-assessments.ts";
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

let assessmentsRepository: InMemoryAssessmentsRepository
let sut: GetStudentAssessmentsUseCase

describe(('Get Student Assessments Use Case'), () => {
  beforeEach(() => {
    assessmentsRepository = new InMemoryAssessmentsRepository()
    sut = new GetStudentAssessmentsUseCase(assessmentsRepository)
  })

  it ('should be able to get student assessments', async () => {
    for (let i = 1; i <= 3; i++) {
      const assessment = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-1') })
      assessmentsRepository.create(assessment)
    }

    const result = await sut.execute({ courseId: 'course-1', studentId: 'student-1' })
    
    expect(result.isRight()).toBe(true)
    expect(result.value?.assessments).toHaveLength(3)
  })
})