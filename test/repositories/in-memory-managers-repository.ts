import { ManagersRepository } from "@/domain/boletim/app/repositories/managers-repository.ts";
import { Manager } from "@/domain/boletim/enterprise/entities/manager.ts";

export class InMemoryManagersRepository implements ManagersRepository {
  public items: Manager[] = []

  async findById(id: string): Promise<Manager | null> {
    const manager = this.items.find(item => item.id.toValue() === id)
    return manager ?? null
  }

  async findByCPF(cpf: string): Promise<Manager | null> {
    const manager = this.items.find(item => item.cpf === cpf)
    return manager ?? null
  }

  async findByEmail(email: string): Promise<Manager | null> {
    const manager = this.items.find(item => item.email === email)
    return manager ?? null
  }

  async create(manager: Manager): Promise<void> {
    this.items.push(manager)
  }

  async save(manager: Manager): Promise<void> {
    const managerIndex = this.items.findIndex(item => item.equals(manager))
    this.items[managerIndex] = manager
  }
}