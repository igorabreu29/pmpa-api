import { PolesRepository } from "@/domain/app/repositories/poles-repository.ts";
import { Pole } from "@/domain/enterprise/entities/pole.ts";

export class InMemoryPolesRepository implements PolesRepository {
  public items: Pole[] = []

  async findById(id: string): Promise<Pole | null> {
    const pole = this.items.find(item => item.id.toValue() === id)
    return pole ?? null
  }

  async findByName(name: string): Promise<Pole | null> {
    const pole = this.items.find(item => item.name === name)
    return pole ?? null
  }
}