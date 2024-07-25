import { ResourceAlreadyExistError } from '@/core/errors/use-case/resource-already-exist-error.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateStudentUseCase } from './create-student.ts'

import bcryptjs from 'bcryptjs'

let studentsRepository: InMemoryStudentsRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let sut: CreateStudentUseCase

describe('Create Student Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
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
    
    sut = new CreateStudentUseCase(
      studentsRepository,
      studentsCoursesRepository,
      studentsPolesRepository,
      coursesRepository,
      polesRepository,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Student', () => {
    it ('should not be able to create student if course not found', async () => {
      const result = await sut.execute({
        courseId: '',
        poleId: '',
        cpf: '',
        email: '',
        username: '',
        birthday: new Date(),
        civilId: 0,
        userId: '',
        userIp: ''
      })
  
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    })
  
    it ('should not be able to create student if pole not found', async () => {
      const course = makeCourse()
      coursesRepository.create(course)
  
      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: '',
        cpf: '',
        email: '',
        username: '',
        birthday: new Date(),
        civilId: 0,
        userId: '',
        userIp: ''
      })
  
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    })

    it ('should be able to create a student in the course and pole', async () => {
      vi.setSystemTime('2022-10-2')
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)

      const spyOn = vi.spyOn(bcryptjs, 'hash').mockImplementation((password: string) => {
        return `Pmp@222.222.222-10-hashed`
      })

      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '222.222.222-10',
        email: 'john@example.com',
        username: 'John Doe',
        birthday: new Date('2004-10-2'),
        civilId: 44444,
        userId: '',
        userIp: ''
      })
      
      expect(result.isRight()).toBe(true)
      expect(studentsRepository.items).toHaveLength(1)
      expect(studentsCoursesRepository.items).toHaveLength(1)
      expect(studentsPolesRepository.items).toHaveLength(1)
      expect(spyOn).toHaveBeenCalledOnce()
    })
  })

  describe('Student With CPF', () => {
    it ('should not be able to create a student in the course if the student(cpf) already present', async () => {
      vi.setSystemTime('2022-1-10')
  
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)
  
      const student = makeStudent()
      studentsRepository.create(student)
  
      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      studentsCoursesRepository.create(studentCourse)
  
      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '000.000.000-00',
        email: student.email.value,
        username: student.username.value,
        birthday: new Date('2004'),
        civilId: 0,
        userId: '',
        userIp: ''
      })
  
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
    })

    it ('should be able to create a student(cpf) in the course and pole', async () => {
      vi.setSystemTime('2022-1-10')

      const course = makeCourse()
      coursesRepository.create(course)

      const pole = makePole()
      polesRepository.create(pole)

      const student = makeStudent()
      studentsRepository.create(student)

      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '000.000.000-00',
        email: student.email.value,
        username: student.username.value,
        birthday: student.birthday.value,
        civilId: 0,
        userId: '',
        userIp: ''
      })

      expect(result.isRight()).toBe(true)
      expect(studentsCoursesRepository.items).toHaveLength(1)
      expect(studentsPolesRepository.items).toHaveLength(1)
    })
  })
  
  describe('Student With Email', () => {
    it ('should not be able to create a student in the course if the student(email) already present', async () => {
      vi.setSystemTime('2022-1-10')
  
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)
  
      const student = makeStudent()
      studentsRepository.create(student)
  
      const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
      studentsCoursesRepository.create(studentCourse)
  
      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '000.000.000-00',
        email: student.email.value,
        username: student.username.value,
        birthday: student.birthday.value,
        civilId: 0,
        userId: '',
        userIp: ''
      })
  
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
    })
  
    it ('should be able to create a student(email) in the course and pole', async () => {
      vi.setSystemTime('2022-1-10')
  
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)
  
      const student = makeStudent()
      studentsRepository.create(student)
  
      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '222.222.222-10',
        email: student.email.value,
        username: student.username.value,
        birthday: student.birthday.value,
        civilId: 0,
        userId: '',
        userIp: ''
      })
  
      expect(result.isRight()).toBe(true)
      expect(studentsCoursesRepository.items).toHaveLength(1)
      expect(studentsPolesRepository.items).toHaveLength(1)
    })
  })
})