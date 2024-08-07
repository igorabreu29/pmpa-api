import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { NotAllowedError } from '@/core/errors/use-case/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { Name } from '../../enterprise/entities/value-objects/name.ts'
import { UpdateStudentUseCase } from './update-student.ts'

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let sut: UpdateStudentUseCase

describe('Update Student Use Case', () => { 
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
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
    sut = new UpdateStudentUseCase (
      studentsRepository,
      studentsCoursesRepository,
      studentsPolesRepository,
    )
  })
  
  it ('should not be able to update a student if access is student', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({ 
      id: student.id.toValue(), 
      role: 'student', 
      username: '', 
      userId: '', 
      userIp: '' ,
      courseId: '',
      newCourseId: '',
      poleId: '',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to update a student that does not exist', async () => {
    const result = await sut.execute({ 
      id: 'not-found', 
      role: 'manager', 
      username: '', 
      userId: '', 
      userIp: '' ,
      courseId: '',
      newCourseId: '',
      poleId: '',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update student if student is not in the course', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({ 
      id: student.id.toValue(), 
      role: 'manager', 
      courseId: 'not-found',
      newCourseId: 'course-1',
      poleId: 'pole-1',
      userId: '', 
      userIp: '' 
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to update a student course', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({
      studentId: student.id,
      courseId: new UniqueEntityId('course')
    })
    studentsCoursesRepository.create(studentCourse)

    const studentPole = makeStudentPole({
      studentId: studentCourse.id,
      poleId: new UniqueEntityId('pole')
    })
    studentsPolesRepository.create(studentPole)

    const result = await sut.execute({ 
      id: student.id.toValue(), 
      role: 'manager', 
      courseId: studentCourse.courseId.toValue(),
      newCourseId: 'new-course',
      poleId: 'pole-1',
      userId: '', 
      userIp: '' 
    })

    expect(result.isRight()).toBe(true)
    expect(studentsCoursesRepository.items[0]).toMatchObject({
      courseId: {
        value: 'new-course'
      }
    })
    
    expect(studentsPolesRepository.items[0]).toMatchObject({
      studentId: studentsCoursesRepository.items[0].id,
      poleId: {
        value: 'pole-1'
      }
    })
  })

  it ('should be able to update a student pole', async () => {
    const student = makeStudent()
    studentsRepository.create(student)

    const course = makeCourse()
    const pole = makePole()

    const studentCourse = makeStudentCourse({
      studentId: student.id,
      courseId: course.id
    })
    studentsCoursesRepository.create(studentCourse)

    const studentPole = makeStudentPole({
      studentId: studentCourse.id,
      poleId: pole.id
    })
    studentsPolesRepository.create(studentPole)

    const result = await sut.execute({ 
      id: student.id.toValue(), 
      role: 'manager', 
      courseId: course.id.toValue(),
      newCourseId: course.id.toValue(),
      poleId: 'new-pole',
      userId: '', 
      userIp: '' 
    })

    expect(result.isRight()).toBe(true)
    expect(studentsPolesRepository.items[0]).toMatchObject({
      studentId: studentCourse.id,
      poleId: {
        value: 'new-pole'
      }
    })
  })

  it ('should be able to update a student', async () => {
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) return
    
    const student = makeStudent({ username: nameOrError.value })
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({
      studentId: student.id,
    })
    studentsCoursesRepository.create(studentCourse)

    const studentPole = makeStudentPole({
      studentId: studentCourse.id
    })
    studentsPolesRepository.create(studentPole)

    const result = await sut.execute({ 
      id: student.id.toValue(), 
      role: 'manager', 
      username: 'Josh Ned', 
      courseId: studentCourse.courseId.toValue(),
      newCourseId: studentCourse.courseId.toValue(),
      poleId: studentPole.poleId.toValue(),
      userId: '', 
      userIp: '' 
    })

    expect(result.isRight()).toBe(true)
    expect(studentsRepository.items[0].username.value).toEqual('Josh Ned')
  })
})