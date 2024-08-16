import type { ReportersRepository } from "@/domain/report/app/repositories/reporters-repository.ts";
import { Reporter } from "@/domain/report/enterprise/entities/reporter.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaReportersMapper } from "../mappers/prisma-reporters-mapper.ts";

export class PrismaReportersRepository implements ReportersRepository {
  async findById({ id }: { id: string; }): Promise<Reporter | null> {
    const reporter = await prisma.user.findUnique({
      where: {
        id
      },

      select: {
        id: true,
        username: true,
        password: true,
        email: true,
        cpf: true,
        civilId: true
      }
    })
    if (!reporter) return null

    return PrismaReportersMapper.toDomain(reporter)
  }
}