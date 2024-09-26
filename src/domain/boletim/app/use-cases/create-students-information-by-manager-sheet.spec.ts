import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts"
import { InMemoryCoursesDisciplinesRepository } from "test/repositories/in-memory-courses-disciplines-repository.ts"
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts"
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts"
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts"
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts"
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts"
import { beforeEach, describe, expect, it } from "vitest"
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts"
import { makeCourse } from "test/factories/make-course.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { makePole } from "test/factories/make-pole.ts"
import { makeStudent } from "test/factories/make-student.ts"
import { makeStudentCourse } from "test/factories/make-student-course.ts"
import { makeStudentPole } from "test/factories/make-student-pole.ts"
import { makeDiscipline } from "test/factories/make-discipline.ts"
import { makeAssessment } from "test/factories/make-assessment.ts"
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { CreateStudentsInformationSheetUseCase } from "./create-students-information-sheet.ts"
import { FakeSheeter } from "test/files/fake-sheeter.ts"
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts"
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts"
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts"
import { CreateStudentsInformationByManagerSheetUseCase } from "./create-students-information-by-manager-sheet.ts"
import { makeManager } from "test/factories/make-manager.ts"
import { makeManagerCourse } from "test/factories/make-manager-course.ts"
import { makeManagerPole } from "test/factories/make-manager-pole.ts"

let managersRepository: InMemoryManagersRepository
let managerPolesRepository: InMemoryManagersPolesRepository
let studentsRepository: InMemoryStudentsRepository
let polesRepository: InMemoryPolesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let coursesRepository: InMemoryCoursesRepository
let managerCoursesRepository: InMemoryManagersCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let sheeter: FakeSheeter

let sut: CreateStudentsInformationByManagerSheetUseCase

describe('Create Students Information By Manager Sheet Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()

    managersRepository = new InMemoryManagersRepository(
      managerCoursesRepository,
      coursesRepository,
      managerPolesRepository,
      polesRepository
    )
    managerPolesRepository = new InMemoryManagersPolesRepository()
    managerCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managerPolesRepository,
      polesRepository,
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
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )

    sheeter = new FakeSheeter()

    sut = new CreateStudentsInformationByManagerSheetUseCase(
      coursesRepository,
      managerCoursesRepository,
      studentsPolesRepository,
      sheeter
    )
  })

  it ('should not be able to create students information sheet if course does not exist', async () => {
    const result = await sut.execute({ courseId: '', managerId: '' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create students information sheet if manager is not present on the course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const manager = makeManager()
    managersRepository.create(manager)

    const result = await sut.execute({ courseId: course.id.toValue(), managerId: manager.id.toValue() })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create students information sheet', async () => {
    const course = makeCourse({ formula: 'CAS' }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const manager = makeManager()
    managersRepository.create(manager)
    
    const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
    managerCoursesRepository.create(managerCourse)

    const managerPole = makeManagerPole({ poleId: pole.id, managerId: managerCourse.id })
    managerPolesRepository.create(managerPole)

    const student1 = makeStudent({}, new UniqueEntityId('student-1'))
    const student2 = makeStudent({}, new UniqueEntityId('student-2'))
    studentsRepository.create(student1)
    studentsRepository.create(student2)

    const studentCourse = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole.id })
    studentsPolesRepository.create(studentPole)
    studentsPolesRepository.create(studentPole2)
  
    const result = await sut.execute({
      courseId: course.id.toValue(),
      managerId: manager.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      filename: `${course.name.value} - Informações dos estudantes.xlsx`
    })
  })
})