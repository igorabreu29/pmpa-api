import { PolesRepository } from "@/domain/boletim/app/repositories/poles-repository.ts";
import { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";

export class InMemoryPolesRepository implements PolesRepository {
  public items: Pole[] = []

  async findById(id: string): Promise<Pole | null> {
    const pole = this.items.find(item => item.id.toValue() === id)
    return pole ?? null
  }

  async findByName(name: string): Promise<Pole | null> {
    const pole = this.items.find(item => item.name.value === name)
    return pole ?? null
  }

  async findMany(): Promise<Pole[]> {
    const poles = this.items.sort((poleA, poleB) => poleA.name.value.localeCompare(poleB.name.value))
    return poles
  }

  async create(pole: Pole): Promise<void> {
    this.items.push(pole)
  }

  async createMany(poles: Pole[]): Promise<void> {
    poles.forEach(pole => {
      this.items.push(pole)
    })
  }
}