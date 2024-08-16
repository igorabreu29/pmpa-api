import { BehaviorsRepository } from "@/domain/boletim/app/repositories/behaviors-repository.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaBehaviorsMapper } from "../mappers/prisma-behaviors-mapper.ts";
import { Behavior } from "@/domain/boletim/enterprise/entities/behavior.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class PrismaBehaviorsRepository implements BehaviorsRepository {
  async findById({ id }: { id: string }): Promise<Behavior | null> {
    const behavior = await prisma.behavior.findUnique({
      where: {
        id
      }
    }) 
    if (!behavior) return null

    return PrismaBehaviorsMapper.toDomain(behavior)
  }

  async findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string, courseId: string }): Promise<Behavior | null> {
    const behavior = await prisma.behavior.findFirst({
      where: {
        studentId,
        courseId
      }
    }) 
    if (!behavior) return null

    return PrismaBehaviorsMapper.toDomain(behavior)
  }

  async findManyByStudentIdAndCourseId({ studentId, courseId }: { studentId: string, courseId: string }): Promise<Behavior[]> {
    const behaviors = await prisma.behavior.findMany({
      where: {
        studentId,
        courseId
      }
    }) 

    return behaviors.map(behavior => PrismaBehaviorsMapper.toDomain(behavior))
  }

  async create(behavior: Behavior): Promise<void> {
    const prismaMapper = PrismaBehaviorsMapper.toPrisma(behavior)
    await prisma.behavior.create({
      data: prismaMapper
    })

    DomainEvents.dispatchEventsForAggregate(behavior.id)
  }

  async update(behavior: Behavior): Promise<void> {
    const prismaMapper = PrismaBehaviorsMapper.toPrisma(behavior)
    await prisma.behavior.update({
      where: {
        id: prismaMapper.id
      },
      data: prismaMapper
    })

    DomainEvents.dispatchEventsForAggregate(behavior.id)
  }

  async delete(behavior: Behavior): Promise<void> {
    const prismaMapper = PrismaBehaviorsMapper.toPrisma(behavior)
    await prisma.behavior.delete({
      where: {
        id: prismaMapper.id
      },
    })

    DomainEvents.dispatchEventsForAggregate(behavior.id)
  }
}