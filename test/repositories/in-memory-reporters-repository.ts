import { ReportersRepository } from "@/domain/report/app/repositories/reporters-repository.ts";
import { Reporter } from "@/domain/report/enterprise/entities/reporter.ts";

export class InMemoryReportersRepository implements ReportersRepository {
  public items: Reporter[] = []

  async findById({ id }: { id: string; }): Promise<Reporter | null> {
    const reporter = this.items.find(item => item.id.toValue() === id)
    return reporter ?? null
  }
}