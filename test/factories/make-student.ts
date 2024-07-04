import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Student } from "@/domain/boletim/enterprise/entities/student.ts";
import { faker } from "@faker-js/faker";

export function makeStudent(
  override: Partial<Student> = {},
  id?: UniqueEntityId
) {
  return Student.create({
    email: faker.internet.email(),
    cpf: '000.000.000-00',
    passwordHash: `test-hasher`,
    username: faker.person.firstName(),
    birthday: faker.date.birthdate(),
    ...override
  }, id)
}