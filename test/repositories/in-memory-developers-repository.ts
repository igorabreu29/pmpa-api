import { AdministratorsRepository } from "@/domain/boletim/app/repositories/administrators-repository.ts";
import { DevelopersRepository } from "@/domain/boletim/app/repositories/developers-repository.ts";
import { Developer } from "@/domain/boletim/enterprise/entities/developer.ts";

export class InMemoryDevelopersRepository implements DevelopersRepository {
  public items: Developer[] = []

  async findById(id: string): Promise<Developer | null> {
    const developer = this.items.find(item => item.id.toValue() === id)
    return developer ?? null
  }

  async findByCPF(cpf: string): Promise<Developer | null> {
    const developer = this.items.find(item => item.cpf.value === cpf)
    return developer ?? null
  }

  async findByEmail(email: string): Promise<Developer | null> {
    const developer = this.items.find(item => item.email.value === email)
    return developer ?? null
  }

  async create(developer: Developer): Promise<void> {
    this.items.push(developer)
  }

  async save(developer: Developer): Promise<void> {
    const developerIndex = this.items.findIndex(item => item.equals(developer))
    this.items[developerIndex] = developer
  }
}