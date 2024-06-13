import { describe, expect, it } from "vitest"
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts"
import { CourseDiscipline } from "./course-discipline.ts"

describe('Course Discipline Entity', () => {
  it ('should be able to receive a id after create course discipline', () => {
    const courseDiscipline = makeCourseDiscipline()

    expect(courseDiscipline.id).toBeTruthy()
  })

  it ('should be able to receive course discipline', () => {
    const courseDiscipline = makeCourseDiscipline()

    expect(courseDiscipline).toBeInstanceOf(CourseDiscipline)
    expect(courseDiscipline).toMatchObject({
      id: courseDiscipline.id,
      courseId: courseDiscipline.courseId,
      disciplineId: courseDiscipline.disciplineId,
      module: courseDiscipline.module,
      expected: courseDiscipline.expected,
      hours: courseDiscipline.hours,
      weight: courseDiscipline.weight
    })
  })
})