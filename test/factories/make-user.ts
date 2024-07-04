import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { User } from "@/domain/boletim/enterprise/entities/user.ts";

export function makeUser(
  override: Partial<User> = {},
  id?: UniqueEntityId
) {
  return User.create({
    username: 'John Doe',
    email: 'john@example.com',
    password: '202020',
    cpf: '01234567811',
    active: true,
    role: 'student',
    ...override
  }, id)
}