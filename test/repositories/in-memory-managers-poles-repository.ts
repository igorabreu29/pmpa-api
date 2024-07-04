import { ManagersPolesRepository } from "@/domain/boletim/app/repositories/managers-poles-repository.ts";
import { ManagerPole } from "@/domain/boletim/enterprise/entities/manager-pole.ts";

export class InMemoryManagersPolesRepository implements ManagersPolesRepository {
  public items: ManagerPole[] = []
  
  async findByStudentIdAndPoleId({ managerId, poleId }: { managerId: string; poleId: string; }): Promise<ManagerPole | null> {
    const managerPole = this.items.find(item => item.managerId.toValue() === managerId && item.poleId.toValue() === poleId)
    return managerPole ?? null
  }

  async create(managerPole: ManagerPole): Promise<void> {
    this.items.push(managerPole)
  }
}