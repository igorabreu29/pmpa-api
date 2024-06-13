import { describe, expect, it } from "vitest"
import { CoursePole } from "./course-pole.ts"
import { makeCoursePole } from "test/factories/make-course-pole.ts"

describe('Pole Course Entity', () => {
  it ('should be able to receive a id after create pole course', () => {
    const coursePole = makeCoursePole()

    expect(coursePole.id).toBeTruthy()
  })

  it ('should be able to receive pole course', () => {
    const coursePole = makeCoursePole()

    expect(coursePole).toBeInstanceOf(CoursePole)
    expect(coursePole).toMatchObject({
      id: coursePole.id,
      courseId: coursePole.courseId,
      poleId: coursePole.poleId
    })
  })
})