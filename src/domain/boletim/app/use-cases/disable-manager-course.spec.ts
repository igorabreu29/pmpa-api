import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeManagerCourse } from "test/factories/make-manager-course.ts";
import { DisableManagerCourseUseCase } from "./disable-manager-course.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";

let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let managersRepository: InMemoryManagersRepository
let sut: DisableManagerCourseUseCase

describe('Disable Manager Course Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    managersPolesRepository = new InMemoryManagersPolesRepository()
    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    sut = new DisableManagerCourseUseCase(
      managersRepository,
      coursesRepository,
      managersCoursesRepository
    )
  })

  it ('should not be able to disable manager course if access is manager or student', async () => {
    const result = await sut.execute({ 
      id: 'not-found', 
      courseId: '', 
      reason: '', 
      userId: '', 
      userIp: '', 
      role: 'manager' 
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to disable manager course if course does not exist', async () => {
    const result = await sut.execute({ 
      id: '', 
      courseId: 'not-found', 
      reason: '',
      userId: '', 
      userIp: '', 
      role: 'admin' 
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to disable manager course if manager does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ 
      id: 'not-found', 
      courseId: course.id.toValue(), 
      reason: '',
      userId: '', 
      userIp: '', 
      role: 'admin' 
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to disable manager course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({
      managerId: manager.id,
      courseId: course.id,
      isActive: true
    })
    managersCoursesRepository.create(managerCourse)

    const result = await sut.execute({ 
      id: manager.id.toValue(), 
      courseId: course.id.toValue(),
      reason: 'Manager stopped going to school',
      userId: 'user-1',
      userIp: '0.0.0.0',
      role: 'admin' 
    })

    expect(result.isRight()).toBe(true)
    expect(managersCoursesRepository.items[0].isActive).toBe(false)
  })
})