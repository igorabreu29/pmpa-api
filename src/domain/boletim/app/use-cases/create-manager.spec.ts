import { ResourceAlreadyExistError } from '@/core/errors/use-case/resource-already-exist-error.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateManagerUseCase } from './create-manager.ts'

import bcryptjs from 'bcryptjs'
import { NotAllowedError } from '@/core/errors/use-case/not-allowed-error.ts'

let managersRepository: InMemoryManagersRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let sut: CreateManagerUseCase

describe('Create Manager Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    managersPolesRepository = new InMemoryManagersPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    sut = new CreateManagerUseCase(
      managersRepository,
      managersCoursesRepository,
      managersPolesRepository,
      coursesRepository,
      polesRepository,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Manager', () => {
    it ('should not be able to create if access is student or manager', async () => {
      const result = await sut.execute({
        courseId: '',
        poleId: '',
        cpf: '',
        email: '',
        username: '',
        birthday: new Date(),
        civilId: '0',
        userId: '',
        userIp: '',
        role: 'manager'
      })
      
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(NotAllowedError)
    })

    it ('should not be able to create manager if course does not exist', async () => {
      const result = await sut.execute({
        courseId: '',
        poleId: '',
        cpf: '',
        email: '',
        username: '',
        birthday: new Date(),
        civilId: '0',
        userId: '',
        userIp: '',
        role: 'admin'
      })
  
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    })
  
    it ('should not be able to create manager if pole not found', async () => {
      const course = makeCourse()
      coursesRepository.create(course)
  
      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: '',
        cpf: '',
        email: '',
        username: '',
        birthday: new Date(),
        civilId: '0',
        userId: '',
        userIp: '',
        role: 'admin'
      })
  
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    })
      
    it ('should be able to create a manager in course and pole', async () => {
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
        birthday: new Date('2002'),
        civilId: '4444',
        userId: '',
        userIp: '',
        role: 'admin'
      })

      expect(result.isRight()).toBe(true)
      expect(managersRepository.items).toHaveLength(1)
      expect(managersCoursesRepository.items).toHaveLength(1)
      expect(managersPolesRepository.items).toHaveLength(1)
      expect(spyOn).toHaveBeenCalledOnce()
    })
  })

  describe('Manager With CPF', () => {
    it ('should not be able to create a manager in the course if manager(cpf) already present', async () => {
      vi.setSystemTime('2022-1-10')
      
      const course = makeCourse()
      coursesRepository.create(course)

      const pole = makePole()
      polesRepository.create(pole)

      const manager = makeManager()
      managersRepository.create(manager)

      const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
      managersCoursesRepository.create(managerCourse)

      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '000.000.000-00',
        email: manager.email.value,
        username: manager.username.value,
        birthday: new Date('2002-2'),
        civilId: '0',
        userId: '',
        userIp: '',
        role: 'admin'
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
    })

    it ('should be able to create manager(cpf) in course and pole', async () => {
      const course = makeCourse()
      coursesRepository.create(course)

      const pole = makePole()
      polesRepository.create(pole)

      const manager = makeManager()
      managersRepository.create(manager)

      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '000.000.000-00',
        email: manager.email.value,
        username: manager.username.value,
        birthday: new Date('2004-4-2'),
        civilId: '0',
        userId: '',
        userIp: '',
        role: 'admin'
      })

      expect(result.isRight()).toBe(true)
      expect(managersCoursesRepository.items).toHaveLength(1)
      expect(managersPolesRepository.items).toHaveLength(1)
    })
  })
  
  describe('Manager With Email', () => {
    it ('should not be able to create manager in course if manager(email) already present', async () => {
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)
  
      const manager = makeManager()
      managersRepository.create(manager)
  
      const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
      managersCoursesRepository.create(managerCourse)
  
      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '000.000.000-00',
        email: manager.email.value,
        username: manager.username.value,
        birthday: new Date('2002'),
        civilId: '0',
        userId: '',
        userIp: '',
        role: 'admin'
      })
  
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
    })

    it ('should be able to create manager(email) in course and pole', async () => {
      const course = makeCourse()
      coursesRepository.create(course)
  
      const pole = makePole()
      polesRepository.create(pole)
  
      const manager = makeManager()
      managersRepository.create(manager)
  
      const result = await sut.execute({
        courseId: course.id.toValue(),
        poleId: pole.id.toValue(),
        cpf: '222.222.222-10',
        email: manager.email.value,
        username: manager.username.value,
        birthday: manager.birthday.value,
        civilId: '0',
        userId: '',
        userIp: '',
        role: 'admin'
      })
  
      expect(result.isRight()).toBe(true)
      expect(managersCoursesRepository.items).toHaveLength(1)
      expect(managersPolesRepository.items).toHaveLength(1)
    })
  })
})