import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";

export function makeCourse(
  override: Partial<Course> = {},
  id?: UniqueEntityId
) {
  return Course.create({
    formule: 'period',
    name: 'CFP - 2024',
    active: 'enabled',
    imageUrl: 'http://random-url',
    modules: null,
    periods: null,
    endsAt: new Date(),

    ...override
  }, id)
}