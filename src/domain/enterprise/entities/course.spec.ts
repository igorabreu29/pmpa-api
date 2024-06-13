import { describe, expect, it } from "vitest"
import { makeCourse } from "test/factories/make-course.ts"
import { Course } from "./course.ts"

describe('Course Entity', () => {
  it ('should be able to receive a id after create course', () => {
    const course = makeCourse()

    expect(course.id).toBeTruthy()
  })

  it ('should be able to receive course', () => {
    const course = makeCourse()

    expect(course).toBeInstanceOf(Course)
    expect(course).toMatchObject({
      id: course.id,
      formule: course.formule,
      name: course.name,
      active: course.active,
      imageUrl: course.imageUrl,
      modules: course.modules,
      periods: course.periods
    })
  })
})