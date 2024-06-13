import { describe, expect, it } from "vitest"
import { UserCourse } from "./user-course.ts"
import { makeUserPole } from "test/factories/make-user-pole.ts"
import { UserPole } from "./user-pole.ts"

describe('User Pole Entity', () => {
  it ('should be able to receive a id after create user pole', () => {
    const userPole = makeUserPole()

    expect(userPole.id).toBeTruthy()
  })

  it ('should be able to receive user pole', () => {
    const userPole = makeUserPole()

    expect(userPole).toBeInstanceOf(UserPole)
    expect(userPole).toMatchObject({
      id: userPole.id,
      poleId: userPole.poleId,
      userId: userPole.userId
    })
  })
})