import { makeReporter } from 'test/factories/make-reporter.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryReportersRepository } from 'test/repositories/in-memory-reporters-repository.ts'
import { InMemoryReportsRepository } from 'test/repositories/in-memory-reports-repository.ts'
import { waitFor } from 'test/utils/wait-for.ts'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'
import { SendReportUseCase, SendReportUseCaseRequest, SendReportUseCaseResponse } from '../use-cases/send-report.ts'
import { StudentEvent } from '@/domain/boletim/enterprise/events/student-event.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { OnStudentDeleted } from './on-student-deleted.ts'
import { OnStudentCourseDeleted } from './on-student-course-deleted.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { StudentCourseDeletedEvent } from '@/domain/boletim/enterprise/events/student-course-deleted-event.ts'

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository

let reportersRepository: InMemoryReportersRepository

let reportsRepository: InMemoryReportsRepository
let sendReportUseCase: SendReportUseCase

let sendReportExecuteSpy: MockInstance<
  [SendReportUseCaseRequest],
  Promise<SendReportUseCaseResponse>
>

describe('On Student Course Deleted', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()

    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )

    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    reportersRepository = new InMemoryReportersRepository()
    reportsRepository = new InMemoryReportsRepository(
      reportersRepository
    )
    
    sendReportUseCase = new SendReportUseCase(
      reportsRepository
    )
    
    sendReportExecuteSpy = vi.spyOn(sendReportUseCase, 'execute')

    new OnStudentCourseDeleted (
      coursesRepository,
      studentsRepository,
      reportersRepository,
      sendReportUseCase
    )
  })

  it ('should send a report when an student course is deleted', async () => {
    const reporter = makeReporter()
    reportersRepository.items.push(reporter)

    const course = makeCourse()
    coursesRepository.create(course)

    const student = makeStudent()
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({
      courseId: course.id,
      studentId: student.id
    })
    studentsCoursesRepository.create(studentCourse)

    studentCourse.addDomainStudentCourseEvent(
      new StudentCourseDeletedEvent({
        reporterId: reporter.id.toValue(),
        reporterIp: '',
        studentCourse
      })
    )
    
    studentsCoursesRepository.delete(studentCourse)

    await waitFor(() => {
      expect(sendReportExecuteSpy).toHaveBeenCalled()
    })
  })
})  