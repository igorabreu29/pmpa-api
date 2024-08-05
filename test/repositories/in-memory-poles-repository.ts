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

  async findMany(page: number): Promise<{ poles: Pole[]; pages: number; totalItems: number; }> {
    const allPoles = this.items.sort((poleA, poleB) => poleA.name.value.localeCompare(poleB.name.value))

    const poles = allPoles.slice((page - 1) * 10, page * 10)
    const pages = Math.ceil(allPoles.length / 10)

    return {
      poles,
      pages,
      totalItems: allPoles.length
    }
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