import { beforeEach, describe, expect, it } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { CreateCourseUseCase } from "./create-course.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { InMemoryCourseDisciplineRepository } from "test/repositories/in-memory-course-discipline-repository.ts";
import { Expected } from "@/domain/enterprise/entities/course-discipline.ts";
import { InMemoryCoursePolesRepository } from "test/repositories/in-memory-course-poles-repository.ts";

let coursesRepository: InMemoryCoursesRepository
let courseDisciplinesRepository: InMemoryCourseDisciplineRepository
let coursePolesRepository: InMemoryCoursePolesRepository
let sut: CreateCourseUseCase

describe('Create Course Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    courseDisciplinesRepository = new InMemoryCourseDisciplineRepository() 
    coursePolesRepository = new InMemoryCoursePolesRepository()
    sut = new CreateCourseUseCase(
      coursesRepository,
      courseDisciplinesRepository,
      coursePolesRepository
    )
  })
  
  it ('should not be able to course user with name already existing', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ formule: course.formule, imageUrl: course.imageUrl, name: course.name, disciplines: [], poleIds: [] })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create course', async () => {
    const disciplines = [
      {
        id: '1',
        module: 1,
        hours: 30,
        expected: 'VF' as Expected,
        weight: 1
      },
      {
        id: '2',
        module: 1,
        hours: 50,
        expected: 'AVI VF' as Expected,
        weight: 1
      },
    ]

    const poleIds = ['1', '2', '3']

    const result = await sut.execute({ formule: 'module', imageUrl: 'random-url', name: 'CFP - 2024', disciplines, poleIds })
    
    expect(result.isRight()).toBe(true)
    expect(coursesRepository.items).toHaveLength(1)
    expect(courseDisciplinesRepository.items).toHaveLength(2)
    expect(courseDisciplinesRepository.items).toMatchObject([
      {
        disciplineId: {
          value: '1'
        }
      },
      {
        disciplineId: {
          value: '2'
        }
      }
    ])
    expect(coursePolesRepository.items).toHaveLength(3)
    expect(coursePolesRepository.items).toMatchObject([
      {
        poleId: {
          value: '1'
        }
      },
      {
        poleId: {
          value: '2'
        }
      },
      {
        poleId: {
          value: '3'
        }
      }
    ])
  })
})