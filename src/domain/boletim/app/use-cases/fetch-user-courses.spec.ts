import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FetchUserCoursesUseCase } from "./fetch-user-courses.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeUser } from "test/factories/make-user.ts";
import { makeUserCourse } from "test/factories/make-user-course.ts";
import { makeCourse } from "test/factories/make-course.ts";

let usersRepository: InMemoryUsersRepository
let coursesRepository: InMemoryCoursesRepository
let usersCourseRepository: InMemoryUsersCourseRepository
let sut: FetchUserCoursesUseCase

describe(('Fetch User Courses Use Case'), () => {
  beforeEach(() => {
    usersCourseRepository = new InMemoryUsersCourseRepository()
    usersRepository = new InMemoryUsersRepository(
      usersCourseRepository
    )
    coursesRepository = new InMemoryCoursesRepository (
      usersCourseRepository
    )
    sut = new FetchUserCoursesUseCase(usersRepository, coursesRepository)
  })

  it ('should not be able to fetch all courses from user if he not exist', async () => {
    const result = await sut.execute({ userId: 'user-not-found', page: 1, perPage: 6 })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch all user courses', async () => {
    const user = makeUser()
    usersRepository.create(user)
    
    const course1 = makeCourse({ name: 'CFP - 2024' })
    coursesRepository.create(course1)
    const course2 = makeCourse({ name: 'CFO - 2020' })
    coursesRepository.create(course2)
    
    const usersCourse1 = makeUserCourse({ userId: user.id, courseId: course1.id })
    usersCourseRepository.create(usersCourse1)
    const usersCourse2 = makeUserCourse({ userId: user.id, courseId: course2.id })
    usersCourseRepository.create(usersCourse2)

    const result = await sut.execute({ userId: user.id.toValue(), page: 1, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      courses: [
        {
          name: 'CFP - 2024'
        },
        {
          name: 'CFO - 2020'
        },
      ]
    })
  })

  it ('should be able to paginated user courses', async () => {
    const user = makeUser()
    usersRepository.create(user)
    
    for (let i = 1; i <= 8; i++) {
      const course = makeCourse({ name: `course-${i}` })
      coursesRepository.create(course)

      const userCourses = makeUserCourse({ userId: user.id, courseId: course.id })
      usersCourseRepository.create(userCourses)
    }

    const result = await sut.execute({ userId: user.id.toValue(), page: 2, perPage: 6 })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      totalItems: 8,
      pages: 2
    })
    expect(result.value).toMatchObject({
      courses: [
        {
          name: 'course-7'
        },
        {
          name: 'course-8'
        },
      ]
    })
  })
})