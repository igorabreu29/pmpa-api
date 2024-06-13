import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { UpdateUserUseCase } from "./update-user.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeUser } from "test/factories/make-user.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";

let usersRepository: InMemoryUsersRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let sut: UpdateUserUseCase

describe(('Update User Use Case'), () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    sut = new UpdateUserUseCase(usersRepository, coursesRepository, polesRepository)
  })

  it ('should not be able to update user if he does not exist', async () => {
    const result = await sut.execute({ userId: 'not-found', currentCourseId: '', currentPoleId: '', previousCourseId: '', previousPoleId: '' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update user course if the course does not exist', async () => {
    const user = makeUser()
    usersRepository.create(user)

    const result = await sut.execute({ userId: user.id.toValue(), currentCourseId: 'not-found', currentPoleId: '', previousCourseId: '', previousPoleId: '' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update user course if the pole does not exist', async () => {
    const user = makeUser()
    usersRepository.create(user)

    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ userId: user.id.toValue(), currentCourseId: course.id.toValue(), currentPoleId: '', previousCourseId: '', previousPoleId: '' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to update user', async () => {
    const previousCourse = makeCourse({ name: 'Node.js' })
    coursesRepository.create(previousCourse)
    const previousPole = makePole({ name: '1' })
    polesRepository.items.push(previousPole)
    const user = makeUser({ courses: [previousCourse], poles: [previousPole] })
    usersRepository.create(user)

    const currentCourse = makeCourse({ name: 'React.js' })
    coursesRepository.create(currentCourse)
    const currentPole = makePole({ name: '2' })
    polesRepository.items.push(currentPole)

    expect(usersRepository.items[0].courses[0].name).toEqual('Node.js')
    expect(usersRepository.items[0].poles[0].name).toEqual('1')

    const result = await sut.execute({ 
      userId: user.id.toValue(), 
      currentCourseId: currentCourse.id.toValue(), 
      currentPoleId: currentPole.id.toValue(), 
      previousCourseId: previousCourse.id.toValue(), 
      previousPoleId: previousPole.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items[0].courses[0].name).toEqual('React.js')
    expect(usersRepository.items[0].poles[0].name).toEqual('2')
  })
})