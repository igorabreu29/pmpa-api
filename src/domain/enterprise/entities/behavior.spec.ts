import { describe, expect, it } from "vitest"
import { makeBehavior } from "test/factories/make-behavior.ts"
import { Behavior } from "./behavior.ts"

describe('Assessment Entity', () => {
  it ('should be able to receive a id after create behavior', () => {
    const behavior = makeBehavior()
    
    expect(behavior.id).toBeTruthy()
  })

  it ('should be able to receive behavior', () => {
    const behavior = makeBehavior()

    expect(behavior).toBeInstanceOf(Behavior)
    expect(behavior).toMatchObject({
      id: behavior.id,
      studentId: behavior.studentId,
      courseId: behavior.courseId,
      poleId: behavior.poleId
    })
  })
})