import { BehaviorsBatchRepository } from "@/domain/boletim/app/repositories/behaviors-batch-repository.ts";
import { BehaviorBatch } from "@/domain/boletim/enterprise/entities/behavior-batch.ts";
import { PrismaBehaviorsMapper } from "../mappers/prisma-behaviors-mapper.ts";
import { prisma } from "../lib/prisma.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class PrismaBehaviorsBatchRepository implements BehaviorsBatchRepository {
  async create(behaviorBatch: BehaviorBatch): Promise<void> {
    const prismaMapper = behaviorBatch.behaviors.map(behavior => PrismaBehaviorsMapper.toPrisma(behavior))
    await prisma.behavior.createMany({
      data: prismaMapper
    })

    DomainEvents.dispatchEventsForAggregate(behaviorBatch.id)
  }

  async save(behaviorBatch: BehaviorBatch): Promise<void> {
    const prismaMapper = behaviorBatch.behaviors.map(behavior => PrismaBehaviorsMapper.toPrisma(behavior))

    await Promise.all(prismaMapper.map(async item => {
      await prisma.behavior.update({
        where: {
          id: item.id
        },

        data: item
      })
    }))

    DomainEvents.dispatchEventsForAggregate(behaviorBatch.id)
  }
}