import { beforeEach, describe, expect, it } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { CreateCourseUseCase } from "./create-course.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { Expected } from "../../enterprise/entities/discipline.ts";

let usersCoursesRepository: InMemoryUsersCourseRepository
let coursesRepository: InMemoryCoursesRepository
let sut: CreateCourseUseCase

describe('Create Course Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository(
      usersCoursesRepository
    )
    sut = new CreateCourseUseCase(
      coursesRepository
    )
  })
  
  it ('should not be able to course user with name already existing', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ formule: course.formule, imageUrl: course.imageUrl, name: course.name, endsAt: new Date() })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create course', async () => {
    const result = await sut.execute({ formule: 'module', imageUrl: 'random-url', name: 'CFP - 2024', endsAt: new Date() })
    
    expect(result.isRight()).toBe(true)
    expect(coursesRepository.items).toHaveLength(1)
  })
})