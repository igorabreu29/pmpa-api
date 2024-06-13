import { describe, expect, it } from "vitest"
import { makeDiscipline } from "test/factories/make-discipline.ts"
import { Discipline } from "./discipline.ts"

describe('Discipline Entity', () => {
  it ('should be able to receive a id after create discipline', () => {
    const discipline = makeDiscipline()
    
    expect(discipline.id).toBeTruthy()
  })

  it ('should be able to receive discipline', () => {
    const discipline = makeDiscipline()

    expect(discipline).toBeInstanceOf(Discipline)
    expect(discipline).toMatchObject({
      id: discipline.id,
      name: discipline.name,
    })
  })
})