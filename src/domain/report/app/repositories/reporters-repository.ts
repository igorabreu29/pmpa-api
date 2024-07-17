import { Reporter } from "../../enterprise/entities/reporter.ts";

export abstract class ReportersRepository {
  abstract findById({ id }: { id: string }): Promise<Reporter | null>
}