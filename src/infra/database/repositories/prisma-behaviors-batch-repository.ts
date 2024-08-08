import { BehaviorsBatchRepository } from "@/domain/boletim/app/repositories/behaviors-batch-repository.ts";
import { BehaviorBatch } from "@/domain/boletim/enterprise/entities/behavior-batch.ts";
import { PrismaBehaviorsMapper } from "../mappers/prisma-behaviors-mapper.ts";
import { prisma } from "../lib/prisma.ts";

export class PrismaBehaviorsBatchRepository implements BehaviorsBatchRepository {
  async create(behaviorBatch: BehaviorBatch): Promise<void> {
    const prismaMapper = behaviorBatch.behaviors.map(behavior => PrismaBehaviorsMapper.toPrisma(behavior))
    await prisma.behavior.createMany({
      data: prismaMapper
    })
  }

  async save(behaviorBatch: BehaviorBatch): Promise<void> {
    const prismaMapper = behaviorBatch.behaviors.map(behavior => PrismaBehaviorsMapper.toPrisma(behavior))

    await Promise.all(prismaMapper.map(item => {
      prisma.behavior.update({
        where: {
          id: item.id
        },

        data: item
      })
    }))
  }
}