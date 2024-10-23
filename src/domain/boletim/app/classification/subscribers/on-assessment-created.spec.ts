import { makeAssessment } from 'test/factories/make-assessment.ts'
import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { AssessmentEvent } from '@/domain/boletim/enterprise/events/assessment-event.ts'
import { CreateStudentClassificationUseCase } from '../../use-cases/create-student-classification.ts'
import { InMemoryBehaviorsRepository } from 'test/repositories/in-memory-behaviors-repository.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import { InMemoryClassificationsRepository } from 'test/repositories/in-memory-classifications-repository.ts'
import { GetStudentAverageInTheCourseUseCase } from '../../use-cases/get-student-average-in-the-course.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { makeGetStudentAverageInTheCourseUseCase } from 'test/factories/make-get-student-average-in-the-course-use-case.ts'
import { OnAssessmentCreatedClassification } from './on-assessment-created-classification.ts'

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let classificationsRepository: InMemoryClassificationsRepository
let getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase

let createStudentClassificationUseCase: CreateStudentClassificationUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Assessment Created', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository ()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository,
      assessmentsRepository
    )
    classificationsRepository = new InMemoryClassificationsRepository()
    getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase({
      assessmentsRepository,
      behaviorsRepository,
      disciplinesRepository,
      courseDisciplinesRepository
    })

    createStudentClassificationUseCase = new CreateStudentClassificationUseCase(
      coursesRepository,
      studentsCoursesRepository,
      getStudentAverageInTheCourseUseCase,
      classificationsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(createStudentClassificationUseCase, 'execute')

    new OnAssessmentCreatedClassification (
      createStudentClassificationUseCase
    )
  })

  it ('should send a report when an assessment is created', async () => {
    const assessment = makeAssessment()
    assessment.addDomainAssessmentEvent(new AssessmentEvent({ assessment, reporterId: assessment.id.toValue(), reporterIp: '', courseName: '', disciplineName: '', studentName: "" }))
    assessmentsRepository.create(assessment)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  