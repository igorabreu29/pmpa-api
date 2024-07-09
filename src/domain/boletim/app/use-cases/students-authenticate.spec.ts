import { FakeEncrypter } from "test/cryptograpy/fake-encrypter.ts";
import { FakeHasher } from "test/cryptograpy/fake-hasher.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { StudentsAuthenticateUseCase } from "./students-authenticate.ts";

let studentsRepository: InMemoryStudentsRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let sut: StudentsAuthenticateUseCase

describe('Students Authenticate Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new StudentsAuthenticateUseCase(studentsRepository, hasher, encrypter)
  })

  it ('should not be able to authenticate student with cpf not existing', async () => {
    const result = await sut.execute({ cpf: '01234567811', password: '202020' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it ('should not be able to authenticate student with password not equals', async () => {
    const student = makeStudent({ passwordHash: '202010-hasher' })
    studentsRepository.items.push(student)

    const result = await sut.execute({ cpf: student.cpf, password: '202020' })
 
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
   })

   it ('should be able to receive "{ redirect: true }" if the student does not confirmated login', async () => {
    const student = makeStudent({ passwordHash: '202020-hasher' })
    studentsRepository.items.push(student)

    const result = await sut.execute({ cpf: student.cpf, password: '202020' })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      redirect: true
    })
   })
 
   it ('should be able to authenticate student', async () => {
    const student = makeStudent({ passwordHash: '202020-hasher', loginConfirmation: true })
    studentsRepository.items.push(student)
 
    const result = await sut.execute({ cpf: student.cpf, password: '202020' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
     token: expect.any(String)
    })
   })
})