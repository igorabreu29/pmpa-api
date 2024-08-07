import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryStudentsBatchRepository } from "test/repositories/in-memory-students-batch-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { UpdateStudentsBatchUseCase } from "./update-students-batch.ts";

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let studentsBatchRepository: InMemoryStudentsBatchRepository
let sut: UpdateStudentsBatchUseCase

describe('Update Students Batch Use Case', () => {
  beforeEach(() => {
    polesRepository = new InMemoryPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )

    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    studentsBatchRepository = new InMemoryStudentsBatchRepository()

    sut = new UpdateStudentsBatchUseCase (
      studentsRepository,
      coursesRepository,
      studentsCoursesRepository,
      polesRepository,
      studentsPolesRepository,
      studentsBatchRepository,
    )
  })

  it ('should not be able to update students batch if access is student', async () => {
    const result = await sut.execute({
      courseId: '',
      students: [],
      fileLink: '',
      fileName: '',
      userId: '',
      userIp: '',
      role: 'student'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to update students batch if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      students: [],
      fileLink: '',
      fileName: '',
      userId: '',
      userIp: '',
      role: 'admin'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update students batch if new course does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const students = [
      {
        cpf: '00000000000',
        courseName: 'course-1',
        poleName: 'pole-1',
      },
      {
        cpf: '00000000001',
        courseName: 'course-1',
        poleName: 'pole-1',
      },
    ]

    const result = await sut.execute({
      courseId: course.id.toValue(),
      students,
      fileLink: '',
      fileName: '',
      userId: '',
      userIp: '',
      role: 'admin'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update students batch if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)
    
    const students = [
      {
        cpf: '00000000000',
        courseName: course.name.value,
        poleName: 'pole-1',
      },
      {
        cpf: '00000000001',
        courseName: course.name.value,
        poleName: 'pole-1',
      },
    ]

    const result = await sut.execute({
      courseId: course.id.toValue(),
      students,
      fileLink: '',
      fileName: '',
      userId: '',
      userIp: '',
      role: 'admin'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update students batch if some student does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)
    
    const students = [
      {
        cpf: '00000000000',
        courseName: course.name.value,
        poleName: pole.name.value,
      },
      {
        cpf: '00000000001',
        courseName: course.name.value,
        poleName: pole.name.value,
      },
    ]

    const result = await sut.execute({
      courseId: course.id.toValue(),
      students,
      fileLink: '',
      fileName: '',
      userId: '',
      userIp: '',
      role: 'admin'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to update course of students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent()
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({
      courseId: course.id,
      studentId: student.id
    })
    studentsCoursesRepository.create(studentCourse)

    const studentPole = makeStudentPole({
      poleId: pole.id,
      studentId: studentCourse.id
    })
    studentsPolesRepository.create(studentPole)

    const cpfOrError = CPF.create('000.000.000-01')
    if (cpfOrError.isLeft()) return

    const student2 = makeStudent({
      cpf: cpfOrError.value
    })
    studentsRepository.create(student2)

    const studentCourse2 = makeStudentCourse({
      studentId: student2.id,
      courseId: course.id
    })
    studentsCoursesRepository.create(studentCourse2)

    const studentPole2 = makeStudentPole({
      poleId: pole.id,
      studentId: studentCourse2.id
    })
    studentsPolesRepository.create(studentPole2)

    const newCourse = makeCourse()
    coursesRepository.create(newCourse)

    const newPole = makePole()
    polesRepository.create(newPole)

    const students = [
      {
        cpf: student.cpf.value,
        courseName: newCourse.name.value,
        poleName: newPole.name.value,
      },
      {
        cpf: student2.cpf.value,
        courseName: course.name.value,
        poleName: pole.name.value,
      },
    ]

    const result = await sut.execute({
      courseId: course.id.toValue(),
      students,
      fileLink: '',
      fileName: '',
      userId: 'user-1',
      userIp: '127.0.0.1',
      role: 'admin',
    })

    expect(result.isRight()).toBe(true)
    expect(studentsCoursesRepository.items).toHaveLength(2)
    expect(studentsCoursesRepository.items[0]).toMatchObject({
      courseId: course.id,
      studentId: student2.id
    })
    expect(studentsCoursesRepository.items[1]).toMatchObject({
      courseId: newCourse.id,
      studentId: student.id
    })
    expect(studentsPolesRepository.items).toHaveLength(2)
    expect(studentsPolesRepository.items[1]).toMatchObject({
      poleId: newPole.id,
      studentId: studentsCoursesRepository.items[1].id
    })
  })

  it ('should be able to update pole of students', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent()
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({
      courseId: course.id,
      studentId: student.id
    })
    studentsCoursesRepository.create(studentCourse)

    const studentPole = makeStudentPole({
      poleId: pole.id,
      studentId: studentCourse.id
    })
    studentsPolesRepository.create(studentPole)

    const cpfOrError = CPF.create('000.000.000-01')
    if (cpfOrError.isLeft()) return

    const student2 = makeStudent({
      cpf: cpfOrError.value
    })
    studentsRepository.create(student2)

    const studentCourse2 = makeStudentCourse({
      studentId: student2.id,
      courseId: course.id
    })
    studentsCoursesRepository.create(studentCourse2)

    const studentPole2 = makeStudentPole({
      poleId: pole.id,
      studentId: studentCourse2.id
    })
    studentsPolesRepository.create(studentPole2)

    const newPole = makePole()
    polesRepository.create(newPole)

    const students = [
      {
        cpf: student.cpf.value,
        courseName: course.name.value,
        poleName: newPole.name.value,
      },
      {
        cpf: student2.cpf.value,
        courseName: course.name.value,
        poleName: pole.name.value,
      },
    ]

    const result = await sut.execute({
      courseId: course.id.toValue(),
      students,
      fileLink: '',
      fileName: '',
      userId: 'user-1',
      userIp: '127.0.0.1',
      role: 'admin',
    })

    expect(result.isRight()).toBe(true)
    expect(studentsPolesRepository.items).toHaveLength(2)
    expect(studentsPolesRepository.items[1]).toMatchObject({
      poleId: newPole.id,
      studentId: studentCourse.id
    })
  })

  it ('should be able to update students batch', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) return

    const student = makeStudent({ username: nameOrError.value })
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({
      courseId: course.id,
      studentId: student.id
    })
    studentsCoursesRepository.create(studentCourse)

    const studentPole = makeStudentPole({
      poleId: pole.id,
      studentId: studentCourse.id
    })
    studentsPolesRepository.create(studentPole)

    const cpfOrError = CPF.create('000.000.000-01')
    if (cpfOrError.isLeft()) return

    const nameOrError2 = Name.create('John Ned')
    if (nameOrError2.isLeft()) return

    const student2 = makeStudent({
      cpf: cpfOrError.value,
      username: nameOrError2.value
    })
    studentsRepository.create(student2)

    const studentCourse2 = makeStudentCourse({
      studentId: student2.id,
      courseId: course.id
    })
    studentsCoursesRepository.create(studentCourse2)

    const studentPole2 = makeStudentPole({
      poleId: pole.id,
      studentId: studentCourse2.id
    })
    studentsPolesRepository.create(studentPole2)

    const students = [
      {
        cpf: student.cpf.value,
        courseName: course.name.value,
        poleName: pole.name.value,
        username: 'Josh Doe'
      },
      {
        cpf: student2.cpf.value,
        courseName: course.name.value,
        poleName: pole.name.value,
        username: 'Josh Ned'
      },
    ]

    const result = await sut.execute({
      courseId: course.id.toValue(),
      students,
      fileLink: 'http://localhost:3333/faker-image.jpeg',
      fileName: 'faker-image',
      userId: 'user-1',
      userIp: '127.0.0.1',
      role: 'admin',
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items).toMatchObject([
      {
        username: {
          value: 'Josh Doe'
        }
      },
      {
        username: {
          value: 'Josh Ned'
        }
      }
    ])
  })
})