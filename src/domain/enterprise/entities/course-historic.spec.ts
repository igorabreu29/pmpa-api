import { describe, expect, it } from "vitest"
import { makeCourseHistoric } from "test/factories/make-course-historic.ts"
import { CourseHistoric } from "./course-historic.ts"

describe('Course Historic Entity', () => {
  it ('should be able to receive a id after create course historic', () => {
    const courseHistoric = makeCourseHistoric()

    expect(courseHistoric.id).toBeTruthy()
  })

  it ('should be able to receive "Course has been finished" if the end date is less than the start date', async () => {
    const courseHistoric = makeCourseHistoric({ startDate: new Date(2024, 1, 20), finishDate: new Date(2024, 0, 2) })

    expect(courseHistoric.finishDate).toEqual('Course has been finished')
  })

  it ('should be able to receive course historic', () => {
    const courseHistoric = makeCourseHistoric()

    expect(courseHistoric).toBeInstanceOf(CourseHistoric)
    expect(courseHistoric).toMatchObject({
      id: courseHistoric.id,
      courseId: courseHistoric.courseId,
      className: courseHistoric.className,
      startDate: courseHistoric.startDate,
      finishDate: courseHistoric.finishDate,
      commander: courseHistoric.commander,
      divisionBoss: courseHistoric.divisionBoss,
      totalHours: courseHistoric.totalHours, 
      speechs: courseHistoric.speechs,
      internships: courseHistoric.internships 
    })
  })
})