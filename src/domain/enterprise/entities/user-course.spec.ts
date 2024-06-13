import { describe, expect, it } from "vitest"
import { makeUserCourse } from "test/factories/make-user-course.ts"
import { UserCourse } from "./user-course.ts"

describe('User Course Entity', () => {
  it ('should be able to receive a id after create user course', () => {
    const userCourse = makeUserCourse()

    expect(userCourse.id).toBeTruthy()
  })

  it ('should be able to receive user course', () => {
    const userCourse = makeUserCourse()

    expect(userCourse).toBeInstanceOf(UserCourse)
    expect(userCourse).toMatchObject({
      id: userCourse.id,
      courseId: userCourse.courseId,
      userId: userCourse.userId
    })
  })
})