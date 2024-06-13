import { describe, expect, it } from "vitest"
import { makePole } from "test/factories/make-pole.ts"
import { Pole } from "./pole.ts"

describe('Pole Entity', () => {
  it ('should be able to receive a id after create pole', () => {
    const pole = makePole()
    
    expect(pole.id).toBeTruthy()
  })

  it ('should be able to receive pole', () => {
    const pole = makePole()

    expect(pole).toBeInstanceOf(Pole)
    expect(pole).toMatchObject({
      id: pole.id,
      name: pole.name,
    })
  })
})