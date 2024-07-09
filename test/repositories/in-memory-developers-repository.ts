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
    const developer = this.items.find(item => item.cpf === cpf)
    return developer ?? null
  }

  async findByEmail(email: string): Promise<Developer | null> {
    const developer = this.items.find(item => item.email === email)
    return developer ?? null
  }

  async create(developer: Developer): Promise<void> {
    this.items.push(developer)
  }
}