import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Course } from "@/domain/enterprise/entities/course.ts";

export function makeCourse(
  override: Partial<Course> = {},
  id?: UniqueEntityId
) {
  return Course.create({
    formule: 'period',
    name: 'CFP - 2024',
    active: 'enabled',
    imageUrl: 'https://image-url',
    modules: null,
    periods: null,

    poles: [],
    users: [],
    ...override
  }, id)
}